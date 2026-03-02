import type React from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check authentication
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  // If no user or error, redirect to login
  if (!user || error) {
    redirect("/auth/login")
  }

  // Check if email is verified
  if (!user.email_confirmed_at) {
    redirect("/auth/verify-email?email=" + encodeURIComponent(user.email || ""))
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <DashboardSidebar userEmail={user.email || "user@example.com"} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="md:hidden h-14 bg-background border-b flex items-center px-4">
          <h1 className="text-lg font-semibold text-foreground">Rentaro</h1>
        </div>
        <main className="flex-1 relative overflow-y-auto focus:outline-none md:ml-64">
          <div className="py-4 md:py-6">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}
