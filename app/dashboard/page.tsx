"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Users, DollarSign, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { formatKenyaCurrency } from "@/lib/utils"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function DashboardPage() {
  const [propertiesCount, setPropertiesCount] = useState(0)
  const [tenantsCount, setTenantsCount] = useState(0)
  const [maintenanceCount, setMaintenanceCount] = useState(0)
  const [monthlyRevenue, setMonthlyRevenue] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createClient()
        
        const [propsRes, tenantsRes, mainRes, paymentsRes] = await Promise.all([
          supabase.from("properties").select("*", { count: "exact", head: true }),
          supabase.from("tenants").select("*", { count: "exact", head: true }),
          supabase.from("maintenance_requests").select("*", { count: "exact", head: true }).eq("status", "open"),
          supabase.from("rent_payments").select("amount").eq("status", "paid"),
        ])

        setPropertiesCount(propsRes.count || 0)
        setTenantsCount(tenantsRes.count || 0)
        setMaintenanceCount(mainRes.count || 0)
        
        if (paymentsRes.data) {
          const revenue = paymentsRes.data.reduce((sum, payment) => sum + Number(payment.amount), 0)
          setMonthlyRevenue(revenue)
        }
      } catch (error) {
        console.log("[v0] Dashboard stats error")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const stats = [
    {
      name: "Total Properties",
      value: propertiesCount || 0,
      icon: Building2,
      color: "text-primary",
      bgColor: "bg-primary/10",
      href: "/dashboard/properties",
    },
    {
      name: "Active Tenants",
      value: tenantsCount || 0,
      icon: Users,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
      href: "/dashboard/tenants",
    },
    {
      name: "Monthly Revenue",
      value: formatKenyaCurrency(monthlyRevenue),
      icon: DollarSign,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      href: "/dashboard/finances",
    },
    {
      name: "Open Maintenance",
      value: maintenanceCount || 0,
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      href: "/dashboard/maintenance",
    },
  ]

  const quickActions = [
    { name: "Add Property", href: "/dashboard/properties/new", icon: Building2 },
    { name: "Add Tenant", href: "/dashboard/tenants/new", icon: Users },
    { name: "Record Payment", href: "/dashboard/finances/payments/new", icon: DollarSign },
    { name: "Add Expense", href: "/dashboard/finances/expenses/new", icon: AlertTriangle },
  ]

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="pt-12 md:pt-0">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">Welcome to Rentaro Property Management</p>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground truncate pr-2">
                  {stat.name}
                </CardTitle>
                <div className={`p-1.5 md:p-2 rounded-lg ${stat.bgColor} flex-shrink-0`}>
                  <stat.icon className={`h-3 w-3 md:h-4 md:w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Quick Actions</CardTitle>
          <CardDescription className="text-sm">Get started with common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
            {quickActions.map((action) => (
              <Button
                key={action.name}
                asChild
                variant="outline"
                className="h-auto p-3 md:p-4 flex-col gap-2 bg-transparent"
              >
                <Link href={action.href}>
                  <action.icon className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-xs md:text-sm font-medium">{action.name}</span>
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription className="text-sm">Latest updates across your properties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              No recent activity to display. Start by adding properties and tenants.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
            <CardDescription className="text-sm">Important dates and reminders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">No upcoming tasks. Your schedule is clear!</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
