import { NextResponse } from "next/server"
import type { Database } from "@/lib/types/database.types"

// We use service role key to bypass RLS for token validation
// This is because an unauthenticated user needs to validate the token.
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    // 1. Fetch Token from Database directly using Admin bypass (since user is not logged in yet)
    const { data: inviteData, error: fetchError } = await supabaseAdmin
      .from('invite_tokens')
      .select(`
        *,
        companies (
          company_name
        )
      `)
      .eq('token', token)
      .single()

    if (fetchError || !inviteData) {
      console.error("Fetch error or token not found:", fetchError)
      return NextResponse.json({ error: "Invalid or expired invite link" }, { status: 404 })
    }

    // 2. Check if Used
    if (inviteData.is_used) {
      return NextResponse.json({ error: "This invite link has already been used" }, { status: 400 })
    }

    // 3. Check if Expired
    const now = new Date()
    const expiresAt = new Date(inviteData.expires_at)
    
    if (now > expiresAt) {
      return NextResponse.json({ error: "This invite link has expired" }, { status: 400 })
    }

    // 4. Return valid token data
    return NextResponse.json({
      success: true,
      invite: {
        id: inviteData.id,
        role: inviteData.role,
        email: inviteData.email,
        company_id: inviteData.company_id,
        // @ts-ignore - Supabase types can be tricky with joins
        company_name: inviteData.companies?.company_name || "Unknown Company"
      }
    }, { status: 200 })

  } catch (error: any) {
    console.error("Validate Invite Route Error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
