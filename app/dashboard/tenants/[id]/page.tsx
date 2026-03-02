"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Edit, Mail, Phone, MapPin, Calendar, DollarSign, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface TenantPageProps {
  params: {
    id: string
  }
}

export default function TenantPage({ params }: TenantPageProps) {
  const [tenant, setTenant] = useState(null)
  const [recentPayments, setRecentPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()

        const [tenantRes, paymentsRes] = await Promise.all([
          supabase
            .from("tenants")
            .select(`
              *,
              properties (
                id,
                name,
                address,
                monthly_rent as property_rent
              )
            `)
            .eq("id", params.id)
            .single(),
          supabase
            .from("rent_payments")
            .select("*")
            .eq("tenant_id", params.id)
            .order("due_date", { ascending: false })
            .limit(5),
        ])

        setTenant(tenantRes.data)
        setRecentPayments(paymentsRes.data || [])
      } catch (error) {
        console.log("[v0] Error fetching tenant data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  if (loading) {
    return <div className="text-center py-10">Loading tenant details...</div>
  }

  if (!tenant) {
    return <div className="text-center py-10">Tenant not found</div>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-chart-4 text-white"
      case "inactive":
        return "bg-muted text-muted-foreground"
      case "pending":
        return "bg-secondary text-secondary-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const isLeaseExpiringSoon = () => {
    if (!tenant.lease_end_date) return false
    const endDate = new Date(tenant.lease_end_date)
    const today = new Date()
    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {tenant.first_name} {tenant.last_name}
          </h1>
          {tenant.properties && (
            <div className="flex items-center text-muted-foreground mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {tenant.properties.name}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Badge className={getStatusColor(tenant.status)}>{tenant.status}</Badge>
          {isLeaseExpiringSoon() && (
            <Badge className="bg-destructive text-destructive-foreground">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Lease Expiring Soon
            </Badge>
          )}
          <Button asChild>
            <Link href={`/dashboard/tenants/${tenant.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Tenant
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Full Name:</span>
                <span className="font-medium">
                  {tenant.first_name} {tenant.last_name}
                </span>
              </div>

              {tenant.email && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    <a href={`mailto:${tenant.email}`} className="text-primary hover:underline">
                      {tenant.email}
                    </a>
                  </div>
                </div>
              )}

              {tenant.phone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    <a href={`tel:${tenant.phone}`} className="text-primary hover:underline">
                      {tenant.phone}
                    </a>
                  </div>
                </div>
              )}

              <Separator />

              {tenant.emergency_contact_name && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Emergency Contact:</span>
                  <span className="font-medium">{tenant.emergency_contact_name}</span>
                </div>
              )}

              {tenant.emergency_contact_phone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Emergency Phone:</span>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    <a href={`tel:${tenant.emergency_contact_phone}`} className="text-primary hover:underline">
                      {tenant.emergency_contact_phone}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lease Information */}
        <Card>
          <CardHeader>
            <CardTitle>Lease Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {tenant.properties && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Property:</span>
                  <div className="text-right">
                    <div className="font-medium">{tenant.properties.name}</div>
                    <div className="text-sm text-muted-foreground">{tenant.properties.address}</div>
                  </div>
                </div>
              )}

              {tenant.lease_start_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lease Start:</span>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(tenant.lease_start_date)}
                  </div>
                </div>
              )}

              {tenant.lease_end_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lease End:</span>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(tenant.lease_end_date)}
                  </div>
                </div>
              )}

              <Separator />

              {tenant.monthly_rent && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Rent:</span>
                  <div className="flex items-center font-medium text-primary">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {tenant.monthly_rent.toLocaleString()}
                  </div>
                </div>
              )}

              {tenant.deposit_paid && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deposit Paid:</span>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {tenant.deposit_paid.toLocaleString()}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-muted-foreground">Tenant Since:</span>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(tenant.created_at)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Rent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Rent Payments</CardTitle>
          <CardDescription>
            {recentPayments && recentPayments.length > 0
              ? `Last ${recentPayments.length} payment(s)`
              : "No payment history"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentPayments && recentPayments.length > 0 ? (
            <div className="space-y-3">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">${payment.amount.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Due: {formatDate(payment.due_date)}</div>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={
                        payment.status === "paid"
                          ? "bg-chart-4 text-white"
                          : payment.status === "late"
                            ? "bg-destructive text-destructive-foreground"
                            : "bg-secondary text-secondary-foreground"
                      }
                    >
                      {payment.status}
                    </Badge>
                    {payment.paid_date && (
                      <div className="text-sm text-muted-foreground mt-1">Paid: {formatDate(payment.paid_date)}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">No payment history available</p>
              <Button asChild>
                <Link href="/dashboard/finances">Manage Payments</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {tenant.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{tenant.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
