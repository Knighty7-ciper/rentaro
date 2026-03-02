"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Wrench, AlertTriangle, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function MaintenancePage() {
  const [maintenanceRequests, setMaintenanceRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMaintenanceRequests = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from("maintenance_requests")
          .select(`
            *,
            properties (name, address),
            tenants (first_name, last_name)
          `)
          .order("created_at", { ascending: false })

        setMaintenanceRequests(data || [])
      } catch (error) {
        console.log("[v0] Error fetching maintenance requests")
      } finally {
        setLoading(false)
      }
    }

    fetchMaintenanceRequests()
  }, [])

  const openRequests = maintenanceRequests?.filter((req) => req.status === "open") || []
  const inProgressRequests = maintenanceRequests?.filter((req) => req.status === "in_progress") || []
  const completedRequests = maintenanceRequests?.filter((req) => req.status === "completed") || []

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-destructive text-destructive-foreground"
      case "high":
        return "bg-secondary text-secondary-foreground"
      case "medium":
        return "bg-chart-2 text-white"
      case "low":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-secondary text-secondary-foreground"
      case "in_progress":
        return "bg-chart-2 text-white"
      case "completed":
        return "bg-chart-4 text-white"
      case "cancelled":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertTriangle className="h-4 w-4" />
      case "in_progress":
        return <Clock className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <Wrench className="h-4 w-4" />
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

  const MaintenanceCard = ({ request }: { request: any }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{request.title}</CardTitle>
            <div className="text-sm text-muted-foreground">
              {request.properties?.name} • {request.category}
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className={getPriorityColor(request.priority)}>{request.priority}</Badge>
            <Badge className={getStatusColor(request.status)}>
              <div className="flex items-center gap-1">
                {getStatusIcon(request.status)}
                {request.status.replace("_", " ")}
              </div>
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{request.description}</p>

        <div className="space-y-2 text-sm">
          {request.tenants && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reported by:</span>
              <span>
                {request.tenants.first_name} {request.tenants.last_name}
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-muted-foreground">Created:</span>
            <span>{formatDate(request.created_at)}</span>
          </div>

          {request.scheduled_date && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Scheduled:</span>
              <span>{formatDate(request.scheduled_date)}</span>
            </div>
          )}

          {request.estimated_cost && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Est. Cost:</span>
              <span className="text-primary">{formatCurrency(Number(request.estimated_cost))}</span>
            </div>
          )}

          {request.contractor_name && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Contractor:</span>
              <span>{request.contractor_name}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
            <Link href={`/dashboard/maintenance/${request.id}`}>View Details</Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
            <Link href={`/dashboard/maintenance/${request.id}/edit`}>Edit</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Maintenance & Work Orders</h1>
          <p className="text-muted-foreground">Manage property maintenance requests and work orders</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/dashboard/maintenance/new">
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Link>
        </Button>
      </div>

      {/* Status Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Requests</CardTitle>
            <AlertTriangle className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{openRequests.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">{inProgressRequests.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-4">{completedRequests.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
            <Wrench className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{maintenanceRequests?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different request statuses */}
      <Tabs defaultValue="open" className="space-y-4">
        <TabsList>
          <TabsTrigger value="open">Open ({openRequests.length})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({inProgressRequests.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedRequests.length})</TabsTrigger>
          <TabsTrigger value="all">All Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="space-y-4">
          {openRequests.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {openRequests.map((request) => (
                <MaintenanceCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto text-chart-4 mb-4" />
                <p className="text-muted-foreground mb-4">No open maintenance requests</p>
                <Button asChild>
                  <Link href="/dashboard/maintenance/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Request
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="in_progress" className="space-y-4">
          {inProgressRequests.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {inProgressRequests.map((request) => (
                <MaintenanceCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No requests currently in progress</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedRequests.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {completedRequests.map((request) => (
                <MaintenanceCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No completed requests yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {maintenanceRequests && maintenanceRequests.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {maintenanceRequests.map((request) => (
                <MaintenanceCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No maintenance requests yet</p>
                <Button asChild>
                  <Link href="/dashboard/maintenance/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Request
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
