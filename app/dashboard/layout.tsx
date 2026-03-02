import type React from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <DashboardSidebar userEmail="user@example.com" />
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
