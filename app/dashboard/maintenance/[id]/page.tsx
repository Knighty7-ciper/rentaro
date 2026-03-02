"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Edit, MapPin, Calendar, DollarSign, Phone, AlertTriangle, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface MaintenancePageProps {
  params: {
    id: string
  }
}

export default function MaintenancePage({ params }: MaintenancePageProps) {
  const [maintenanceRequest, setMaintenanceRequest] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from("maintenance_requests")
          .select(`
            *,
            properties (id, name, address),
            tenants (id, first_name, last_name, email, phone)
          `)
          .eq("id", params.id)
          .single()

        setMaintenanceRequest(data)
      } catch (error) {
        console.log("[v0] Error fetching maintenance request")
      } finally {
        setLoading(false)
      }
    }

    fetchRequest()
  }, [params.id])

  if (loading) {
    return <div className="text-center py-10">Loading maintenance request...</div>
  }

  if (!maintenanceRequest) {
    return <div className="text-center py-10">Maintenance request not found</div>
  }

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
        return <AlertTriangle className="h-4 w-4" />
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
          <h1 className="text-3xl font-bold text-foreground">{maintenanceRequest.title}</h1>
          <div className="flex items-center text-muted-foreground mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            {maintenanceRequest.properties?.name}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={getPriorityColor(maintenanceRequest.priority)}>
            {maintenanceRequest.priority} priority
          </Badge>
          <Badge className={getStatusColor(maintenanceRequest.status)}>
            <div className="flex items-center gap-1">
              {getStatusIcon(maintenanceRequest.status)}
              {maintenanceRequest.status.replace("_", " ")}
            </div>
          </Badge>
          <Button asChild>
            <Link href={`/dashboard/maintenance/${maintenanceRequest.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Request
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Request Details */}
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-medium capitalize">{maintenanceRequest.category}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Property:</span>
                <div className="text-right">
                  <div className="font-medium">{maintenanceRequest.properties?.name}</div>
                  <div className="text-sm text-muted-foreground">{maintenanceRequest.properties?.address}</div>
                </div>
              </div>

              {maintenanceRequest.tenants && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reported by:</span>
                  <div className="text-right">
                    <div className="font-medium">
                      {maintenanceRequest.tenants.first_name} {maintenanceRequest.tenants.last_name}
                    </div>
                    {maintenanceRequest.tenants.email && (
                      <div className="text-sm text-muted-foreground">{maintenanceRequest.tenants.email}</div>
                    )}
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(maintenanceRequest.created_at)}
                </div>
              </div>

              {maintenanceRequest.scheduled_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scheduled:</span>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(maintenanceRequest.scheduled_date)}
                  </div>
                </div>
              )}

              {maintenanceRequest.completed_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed:</span>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(maintenanceRequest.completed_date)}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cost & Contractor Information */}
        <Card>
          <CardHeader>
            <CardTitle>Cost & Contractor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {maintenanceRequest.estimated_cost && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Cost:</span>
                  <div className="flex items-center font-medium text-primary">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {formatCurrency(Number(maintenanceRequest.estimated_cost))}
                  </div>
                </div>
              )}

              {maintenanceRequest.actual_cost && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Actual Cost:</span>
                  <div className="flex items-center font-medium">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {formatCurrency(Number(maintenanceRequest.actual_cost))}
                  </div>
                </div>
              )}

              {maintenanceRequest.contractor_name && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contractor:</span>
                    <div className="text-right">
                      <div className="font-medium">{maintenanceRequest.contractor_name}</div>
                      {maintenanceRequest.contractor_phone && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="h-3 w-3 mr-1" />
                          <a
                            href={`tel:${maintenanceRequest.contractor_phone}`}
                            className="text-primary hover:underline"
                          >
                            {maintenanceRequest.contractor_phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {!maintenanceRequest.contractor_name && (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No contractor assigned yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">{maintenanceRequest.description}</p>
        </CardContent>
      </Card>

      {/* Notes */}
      {maintenanceRequest.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{maintenanceRequest.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
