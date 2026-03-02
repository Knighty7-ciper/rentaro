"use server"

import { createClient } from "@supabase/supabase-js"

// Create Supabase server action client
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error("Supabase credentials not configured")
  }

  return createClient(url, anonKey)
}

// Updated signIn function with email verification check
export async function signIn(prevState: any, formData: FormData) {
  // Check if formData is valid
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  // Validate required fields
  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  try {
    const supabase = getSupabaseClient()
    
    // First, sign in with password
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    })

    if (error) {
      return { error: error.message }
    }

    // Check if user's email is verified
    if (data.user && !data.user.email_confirmed_at) {
      // Email not verified - sign them back out
      await supabase.auth.signOut()
      return { error: "Please verify your email before signing in. Check your inbox for the verification link." }
    }

    // Return success if email is verified
    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

// Updated signUp function with proper email verification requirement
export async function signUp(prevState: any, formData: FormData) {
  // Check if formData is valid
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  // Validate required fields
  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  try {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        // Redirect to callback route to handle email verification
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
        // Require email confirmation before user can login
        data: {
          email_verified: false,
        }
      },
    })

    if (error) {
      return { error: error.message }
    }

    // Don't auto-login - require email verification first
    return { success: true, message: "Check your email to verify your account before signing in." }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signOut() {
  try {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
  } catch (error) {
    console.error("Sign out error:", error)
  }
}
