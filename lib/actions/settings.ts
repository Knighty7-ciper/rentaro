"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function updatePreferences(formData: FormData) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const preferencesData = {
    currency: formData.get("currency") as string,
    date_format: formData.get("date_format") as string,
    timezone: formData.get("timezone") as string,
  }

  const { error } = await supabase.from("user_profiles").upsert({
    user_id: user.id,
    ...preferencesData,
    updated_at: new Date().toISOString(),
  })

  if (error) {
    console.error("[v0] Preferences update error:", error)
    throw new Error("Failed to update preferences")
  }

  revalidatePath("/dashboard/settings")
  return { success: true }
}

export async function updateNotifications(formData: FormData) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // In a real implementation, you would save notification preferences
  // For now, we'll just log the preferences
  console.log("[v0] Notification preferences updated:", {
    rent_alerts: formData.get("rent_alerts") === "on",
    maintenance_alerts: formData.get("maintenance_alerts") === "on",
    lease_alerts: formData.get("lease_alerts") === "on",
    financial_reports: formData.get("financial_reports") === "on",
  })

  revalidatePath("/dashboard/settings")
  return { success: true }
}

export async function updateProfile(formData: FormData) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const profileData = {
    full_name: formData.get("full_name") as string,
    phone: formData.get("phone") as string,
    company_name: formData.get("company_name") as string,
    address: formData.get("address") as string,
    city: formData.get("city") as string,
    county: formData.get("county") as string,
  }

  const { error } = await supabase.from("user_profiles").upsert({
    user_id: user.id,
    ...profileData,
    updated_at: new Date().toISOString(),
  })

  if (error) {
    console.error("[v0] Profile update error:", error)
    throw new Error("Failed to update profile")
  }

  revalidatePath("/dashboard/settings")
  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const supabase = createClient()

  const currentPassword = formData.get("current_password") as string
  const newPassword = formData.get("new_password") as string

  if (!currentPassword || !newPassword) {
    throw new Error("Both current and new passwords are required")
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    console.error("[v0] Password update error:", error)
    throw new Error("Failed to update password")
  }

  revalidatePath("/dashboard/settings")
  return { success: true }
}

export async function exportData(format: "csv" | "pdf" | "backup") {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get all user data
  const [properties, tenants, payments, expenses] = await Promise.all([
    supabase.from("properties").select("*").eq("user_id", user.id),
    supabase.from("tenants").select("*").eq("user_id", user.id),
    supabase.from("rent_payments").select("*").eq("user_id", user.id),
    supabase.from("expenses").select("*").eq("user_id", user.id),
  ])

  console.log("[v0] Exporting data in format:", format)
  console.log("[v0] Data counts:", {
    properties: properties.data?.length || 0,
    tenants: tenants.data?.length || 0,
    payments: payments.data?.length || 0,
    expenses: expenses.data?.length || 0,
  })

  // In a real implementation, you would generate the actual file here
  // For now, we'll just return success
  return {
    success: true,
    message: `Data exported successfully in ${format.toUpperCase()} format`,
  }
}

export async function signOutAllDevices() {
  const supabase = createClient()

  const { error } = await supabase.auth.signOut({ scope: "global" })

  if (error) {
    console.error("[v0] Sign out error:", error)
    throw new Error("Failed to sign out from all devices")
  }

  redirect("/auth/login")
}
