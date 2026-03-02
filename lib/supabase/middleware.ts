import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function updateSession(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization")
    
    if (!authHeader) {
      // No auth header - let the page handle it
      return NextResponse.next()
    }

    // Verify the session token with Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    )

    // Get the user from auth header token
    const { data: { user }, error } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    )

    if (!user || error) {
      // Invalid session - continue and let page handle redirect
      return NextResponse.next()
    }

    // Session is valid - continue
    return NextResponse.next()
  } catch (error) {
    console.error("[v0] Middleware error:", error)
    // On error, continue and let pages handle auth
    return NextResponse.next()
  }
}
