import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/lib/types/database.types"
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
            } catch {}
          },
        },
      }
    )
    
    // 1. Verify Authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Fetch User Profile to get company_id
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, company_id, role, is_active')
      .eq('auth_id', session.user.id)
      .single()

    if (profileError || !userProfile || !userProfile.company_id || !userProfile.is_active) {
      return NextResponse.json({ error: "Invalid user profile" }, { status: 403 })
    }

    // Only owners and managers can create invites
    if (userProfile.role !== 'owner' && userProfile.role !== 'manager') {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // 3. Parse Request
    const body = await req.json()
    const { role, email } = body

    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 })
    }

    // 4. Generate Unique Token
    const token = crypto.randomBytes(16).toString('hex')
    
    // Set expiration to 7 days from now
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // 5. Insert Invite Token into Database
    const { data: invite, error: insertError } = await supabase
      .from('invite_tokens')
      .insert({
        company_id: userProfile.company_id,
        token: token,
        role: role,
        email: email || null,
        is_used: false,
        expires_at: expiresAt.toISOString(),
        created_by: userProfile.id,
      } as Database['public']['Tables']['invite_tokens']['Insert'])
      .select()
      .single()

    if (insertError) {
      console.error("Error creating invite:", insertError)
      return NextResponse.json({ error: "Failed to create invite token" }, { status: 500 })
    }

    // 6. Return the Generated Token and Link
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${token}`

    return NextResponse.json({
      success: true,
      invite: invite,
      inviteUrl: inviteUrl
    }, { status: 200 })

  } catch (error: any) {
    console.error("Generate Invite Route Error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
