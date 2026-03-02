import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react"

export default async function ReportsPage() {
  const supabase = createClient()

  // Get current month data
  const currentMonth = new Date()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

  // Get previous month for comparison
  const previousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
  const lastDayOfPreviousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0)

  // Fetch financial data
  const [
    { data: currentRentPayments },
    { data: previousRentPayments },
    { data: currentExpenses },
    { data: previousExpenses },
    { data: properties },
    { data: tenants },
    { data: maintenanceRequests },
  ] = await Promise.all([
    supabase
      .from("rent_payments")
      .select("amount, status")
      .gte("due_date", firstDayOfMonth.toISOString())
      .lte("due_date", lastDayOfMonth.toISOString()),
    supabase
      .from("rent_payments")
      .select("amount, status")
      .gte("due_date", previousMonth.toISOString())
      .lte("due_date", lastDayOfPreviousMonth.toISOString()),
    supabase
      .from("expenses")
      .select("amount, category")
      .gte("expense_date", firstDayOfMonth.toISOString())
      .lte("expense_date", lastDayOfMonth.toISOString()),
    supabase
      .from("expenses")
      .select("amount, category")
      .gte("expense_date", previousMonth.toISOString())
      .lte("expense_date", lastDayOfPreviousMonth.toISOString()),
    supabase.from("properties").select("id, status"),
    supabase.from("tenants").select("id, status"),
    supabase.from("maintenance_requests").select("id, status, priority"),
  ])

  // Calculate current month metrics
  const currentRentCollected =
    currentRentPayments?.filter((p) => p.status === "paid").reduce((sum, p) => sum + Number(p.amount), 0) || 0
  const currentTotalExpenses = currentExpenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0
  const currentNetIncome = currentRentCollected - currentTotalExpenses

  // Calculate previous month metrics
  const previousRentCollected =
    previousRentPayments?.filter((p) => p.status === "paid").reduce((sum, p) => sum + Number(p.amount), 0) || 0
  const previousTotalExpenses = previousExpenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0
  const previousNetIncome = previousRentCollected - previousTotalExpenses

  // Calculate percentage changes
  const rentChange =
    previousRentCollected > 0 ? ((currentRentCollected - previousRentCollected) / previousRentCollected) * 100 : 0
  const expenseChange =
    previousTotalExpenses > 0 ? ((currentTotalExpenses - previousTotalExpenses) / previousTotalExpenses) * 100 : 0
  const netIncomeChange =
    previousNetIncome !== 0 ? ((currentNetIncome - previousNetIncome) / Math.abs(previousNetIncome)) * 100 : 0

  // Property and tenant metrics
  const totalProperties = properties?.length || 0
  const occupiedProperties = properties?.filter((p) => p.status === "occupied").length || 0
  const occupancyRate = totalProperties > 0 ? (occupiedProperties / totalProperties) * 100 : 0

  const activeTenants = tenants?.filter((t) => t.status === "active").length || 0

  // Maintenance metrics
  const openMaintenance = maintenanceRequests?.filter((m) => m.status === "open").length || 0
  const urgentMaintenance = maintenanceRequests?.filter((m) => m.priority === "urgent").length || 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`
  }

  const getChangeColor = (value: number) => {
    if (value > 0) return "text-chart-4"
    if (value < 0) return "text-destructive"
    return "text-muted-foreground"
  }

  const getChangeIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-3 w-3" />
    if (value < 0) return <TrendingDown className="h-3 w-3" />
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-muted-foreground">Financial performance and property management insights</p>
      </div>

      {/* Financial Performance */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Financial Performance</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rent Collected</CardTitle>
              <DollarSign className="h-4 w-4 text-chart-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatCurrency(currentRentCollected)}</div>
              <div className={`text-xs flex items-center gap-1 ${getChangeColor(rentChange)}`}>
                {getChangeIcon(rentChange)}
                {formatPercentage(rentChange)} from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatCurrency(currentTotalExpenses)}</div>
              <div className={`text-xs flex items-center gap-1 ${getChangeColor(-expenseChange)}`}>
                {getChangeIcon(expenseChange)}
                {formatPercentage(expenseChange)} from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Net Income</CardTitle>
              <BarChart3 className={`h-4 w-4 ${currentNetIncome >= 0 ? "text-chart-4" : "text-destructive"}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${currentNetIncome >= 0 ? "text-chart-4" : "text-destructive"}`}>
                {formatCurrency(currentNetIncome)}
              </div>
              <div className={`text-xs flex items-center gap-1 ${getChangeColor(netIncomeChange)}`}>
                {getChangeIcon(netIncomeChange)}
                {formatPercentage(netIncomeChange)} from last month
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Property & Tenant Metrics */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Property & Tenant Metrics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Properties</CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalProperties}</div>
              <div className="text-xs text-muted-foreground">{occupiedProperties} occupied</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Occupancy Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-chart-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{occupancyRate.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">
                {occupiedProperties} of {totalProperties} properties
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Tenants</CardTitle>
              <Calendar className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{activeTenants}</div>
              <div className="text-xs text-muted-foreground">Currently active</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Maintenance Issues</CardTitle>
              <BarChart3 className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{openMaintenance}</div>
              <div className="text-xs text-muted-foreground">
                {urgentMaintenance > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {urgentMaintenance} urgent
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
          <CardDescription>
            Key insights for {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Financial Highlights</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Collected {formatCurrency(currentRentCollected)} in rent payments</li>
                <li>• Spent {formatCurrency(currentTotalExpenses)} on property expenses</li>
                <li>• Net income of {formatCurrency(currentNetIncome)} this month</li>
                <li>
                  • {rentChange >= 0 ? "Increased" : "Decreased"} rent collection by {Math.abs(rentChange).toFixed(1)}%
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Property Status</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {occupancyRate.toFixed(1)}% occupancy rate across all properties</li>
                <li>
                  • {activeTenants} active tenant{activeTenants !== 1 ? "s" : ""}
                </li>
                <li>
                  • {openMaintenance} open maintenance request{openMaintenance !== 1 ? "s" : ""}
                </li>
                {urgentMaintenance > 0 && (
                  <li>
                    • {urgentMaintenance} urgent maintenance issue{urgentMaintenance !== 1 ? "s" : ""} need attention
                  </li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
