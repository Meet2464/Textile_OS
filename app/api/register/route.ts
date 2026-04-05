import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/types/database.types"

// Admin client using service role key bypasses RLS entirely.
// Safe here because all data is validated server-side.
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, companyName, ownerName, companyCode } = body

    if (!email || !password || !companyName || !ownerName || !companyCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // 0. Check if email is already fully registered (has a users DB row)
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email.trim())
      .maybeSingle()

    if (existingUser) {
      return NextResponse.json(
        { error: "This email is already registered. Please sign in instead." },
        { status: 409 }
      )
    }

    // 1. Check for orphaned auth user (auth exists but no DB row — previous failed attempt)
    //    If found, delete it so we can create fresh.
    const { data: authList } = await supabaseAdmin.auth.admin.listUsers()
    const orphanedAuthUser = authList?.users?.find(
      (u) => u.email?.toLowerCase() === email.trim().toLowerCase()
    )
    if (orphanedAuthUser) {
      await supabaseAdmin.auth.admin.deleteUser(orphanedAuthUser.id)
    }

    // 2. Create Auth User via admin (auto-confirms email — no confirmation email needed)
    const { data: newAuthData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
    })

    if (authError || !newAuthData?.user) {
      return NextResponse.json(
        { error: `Auth user creation failed: ${authError?.message ?? 'Unknown error'}` },
        { status: 500 }
      )
    }

    const authId = newAuthData.user.id

    // 3. Insert Company
    const { data: company, error: companyError } = await supabaseAdmin
      .from("companies")
      .insert({
        company_name: companyName.trim(),
        owner_name: ownerName.trim(),
        company_id_code: companyCode,
        phone: null,
        address: null,
        is_active: true,
      })
      .select()
      .single()

    if (companyError || !company) {
      // Rollback auth user
      await supabaseAdmin.auth.admin.deleteUser(authId)
      if (companyError?.code === "23505") {
        return NextResponse.json(
          { error: "This Company ID is already taken. Please try again." },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: `Company creation failed: ${companyError?.message}` },
        { status: 500 }
      )
    }

    // 4. Insert Owner User Profile
    const { error: userError } = await supabaseAdmin
      .from("users")
      .insert({
        auth_id: authId,
        company_id: company.id,
        name: ownerName.trim(),
        email: email.trim(),
        role: "boss" as const,
        is_active: true,
      })

    if (userError) {
      // Rollback both
      await supabaseAdmin.from("companies").delete().eq("id", company.id)
      await supabaseAdmin.auth.admin.deleteUser(authId)
      return NextResponse.json(
        { error: `User profile creation failed: ${userError.message}` },
        { status: 500 }
      )
    }

    // 5. Initialize Counters
    await supabaseAdmin.from("counters").insert([
      { company_id: company.id, counter_type: "po_number", current_value: 0 },
      { company_id: company.id, counter_type: "challan", current_value: 0 },
      { company_id: company.id, counter_type: "receiving", current_value: 0 },
    ])

    return NextResponse.json({ success: true, companyId: company.id }, { status: 201 })
  } catch (error: any) {
    console.error("Register Route Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
