import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching properties:", error)
    const message = error instanceof Error ? error.message : "Failed to fetch properties"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { data, error } = await supabase
      .from("properties")
      .insert([
        {
          ...body,
          user_id: session.user.id,
        },
      ])
      .select()

    if (error) {
      console.error("Supabase insert error:", error)
      throw error
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error("Error creating property:", error)
    const message = error instanceof Error ? error.message : "Failed to create property"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
