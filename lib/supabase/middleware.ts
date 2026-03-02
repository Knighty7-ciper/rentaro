import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  try {
    // Simply pass through requests - authentication is handled in each page/API route
    // This prevents middleware issues in v0 preview environment
    return NextResponse.next()
  } catch (error) {
    console.error("[v0] Middleware error:", error)
    return NextResponse.next()
  }
}
