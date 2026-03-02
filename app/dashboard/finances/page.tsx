"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, DollarSign, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function FinancesPage() {
  const [rentPayments, setRentPayments] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        const supabase = createClient()
        const currentMonth = new Date()
        const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

        const [paymentsRes, expensesRes] = await Promise.all([
          supabase
            .from("rent_payments")
            .select(`
              *,
              tenants (first_name, last_name),
              properties (name)
            `)
            .gte("due_date", firstDayOfMonth.toISOString())
            .lte("due_date", lastDayOfMonth.toISOString())
            .order("due_date", { ascending: false }),
          supabase
            .from("expenses")
            .select("*")
            .gte("date", firstDayOfMonth.toISOString())
            .lte("date", lastDayOfMonth.toISOString())
            .order("date", { ascending: false }),
        ])

        setRentPayments(paymentsRes.data || [])
        setExpenses(expensesRes.data || [])
      } catch (error) {
        console.log("[v0] Error fetching financial data")
      } finally {
        setLoading(false)
      }
    }

    fetchFinancialData()
  }, [])

  // Calculate totals
  const totalRentDue = rentPayments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0
  const totalRentPaid =
    rentPayments?.filter((p) => p.status === "paid").reduce((sum, payment) => sum + Number(payment.amount), 0) || 0
  const totalExpenses = expenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0
  const netIncome = totalRentPaid - totalExpenses

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-chart-4 text-white"
      case "late":
        return "bg-destructive text-destructive-foreground"
      case "partial":
        return "bg-secondary text-secondary-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Finances</h1>
          <p className="text-muted-foreground">Track rent payments, expenses, and financial reports</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/finances/payments/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Payment
            </Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/dashboard/finances/expenses/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Link>
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rent Due This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(totalRentDue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rent Collected</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-4">{formatCurrency(totalRentPaid)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(totalExpenses)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Income</CardTitle>
            <DollarSign className={`h-4 w-4 ${netIncome >= 0 ? "text-chart-4" : "text-destructive"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netIncome >= 0 ? "text-chart-4" : "text-destructive"}`}>
              {formatCurrency(netIncome)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Payments and Expenses */}
      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">Rent Payments</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Rent Payments</CardTitle>
              <CardDescription>Current month rent payment status</CardDescription>
            </CardHeader>
            <CardContent>
              {rentPayments && rentPayments.length > 0 ? (
                <div className="space-y-3">
                  {rentPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">
                          {payment.tenants?.first_name} {payment.tenants?.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {payment.properties?.name} • Due: {formatDate(payment.due_date)}
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="font-medium">{formatCurrency(Number(payment.amount))}</div>
                        <Badge className={getPaymentStatusColor(payment.status)}>{payment.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No rent payments recorded for this month</p>
                  <Button asChild>
                    <Link href="/dashboard/finances/payments/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Record Payment
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
              <CardDescription>Current month property expenses</CardDescription>
            </CardHeader>
            <CardContent>
              {expenses && expenses.length > 0 ? (
                <div className="space-y-3">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">{expense.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {expense.category} • {expense.properties?.name || "General"} •{" "}
                          {formatDate(expense.expense_date)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-destructive">{formatCurrency(Number(expense.amount))}</div>
                        {expense.vendor && <div className="text-sm text-muted-foreground">{expense.vendor}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No expenses recorded for this month</p>
                  <Button asChild>
                    <Link href="/dashboard/finances/expenses/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Expense
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
