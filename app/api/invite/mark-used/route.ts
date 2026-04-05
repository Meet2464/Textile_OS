import { NextResponse } from "next/server"
import type { Database } from "@/lib/types/database.types"
import { createClient } from "@supabase/supabase-js"

// We use service role key to bypass RLS to mark tokens as used
// because the newly registered user doesn't have permissions to update invite_tokens yet.
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { token_id } = body

    if (!token_id) {
      return NextResponse.json({ error: "Token ID is required" }, { status: 400 })
    }

    const { error: updateError } = await supabaseAdmin
      .from('invite_tokens')
      .update({ is_used: true } as never)
      .eq('id', token_id)

    if (updateError) {
      console.error("Mark used error:", updateError)
      return NextResponse.json({ error: "Failed to mark token as used" }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })

  } catch (error: any) {
    console.error("Mark Invite Used Route Error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
