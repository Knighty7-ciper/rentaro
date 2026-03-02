"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function TenantsPage() {
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from("tenants")
          .select(`
            *,
            properties (
              name,
              address
            )
          `)
          .order("created_at", { ascending: false })
        
        setTenants(data || [])
      } catch (error) {
        console.log("[v0] Error fetching tenants")
      } finally {
        setLoading(false)
      }
    }

    fetchTenants()
  }, [])

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tenants</h1>
          <p className="text-muted-foreground">Manage your rental tenants</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/dashboard/tenants/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Tenant
          </Link>
        </Button>
      </div>

      {!tenants || tenants.length === 0 ? (
        <Card>
          <CardHeader className="text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>No Tenants Yet</CardTitle>
            <CardDescription>Start by adding your first tenant</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/dashboard/tenants/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Tenant
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tenants.map((tenant) => (
            <Card key={tenant.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {tenant.first_name} {tenant.last_name}
                    </CardTitle>
                    {tenant.properties && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        {tenant.properties.name}
                      </div>
                    )}
                  </div>
                  <Badge className={getStatusColor(tenant.status)}>{tenant.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {tenant.email && (
                  <div className="flex items-center text-sm">
                    <Mail className="h-3 w-3 mr-2 text-muted-foreground" />
                    <span className="truncate">{tenant.email}</span>
                  </div>
                )}

                {tenant.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="h-3 w-3 mr-2 text-muted-foreground" />
                    <span>{tenant.phone}</span>
                  </div>
                )}

                {tenant.monthly_rent && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Monthly Rent:</span>
                    <span className="font-medium text-primary">${tenant.monthly_rent.toLocaleString()}</span>
                  </div>
                )}

                {tenant.lease_start_date && tenant.lease_end_date && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Lease Start:</span>
                      <span className="text-sm">{formatDate(tenant.lease_start_date)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Lease End:</span>
                      <span className="text-sm">{formatDate(tenant.lease_end_date)}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
                    <Link href={`/dashboard/tenants/${tenant.id}`}>View Details</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
                    <Link href={`/dashboard/tenants/${tenant.id}/edit`}>Edit</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
