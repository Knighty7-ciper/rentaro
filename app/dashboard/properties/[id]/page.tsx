"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Edit, MapPin, Bed, Bath, Square, DollarSign, Calendar } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface PropertyPageProps {
  params: {
    id: string
  }
}

export default function PropertyPage({ params }: PropertyPageProps) {
  const [property, setProperty] = useState(null)
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        
        const [propRes, tenantsRes] = await Promise.all([
          supabase.from("properties").select("*").eq("id", params.id).single(),
          supabase.from("tenants").select("*").eq("property_id", params.id).eq("status", "active"),
        ])

        setProperty(propRes.data)
        setTenants(tenantsRes.data || [])
      } catch (error) {
        console.log("[v0] Error fetching property details")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  if (loading) {
    return <div className="text-center py-10">Loading property details...</div>
  }

  if (!property) {
    return <div className="text-center py-10">Property not found</div>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "occupied":
        return "bg-chart-4 text-white"
      case "vacant":
        return "bg-secondary text-secondary-foreground"
      case "maintenance":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{property.name}</h1>
          <div className="flex items-center text-muted-foreground mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            {property.address}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={getStatusColor(property.status)}>{property.status}</Badge>
          <Button asChild>
            <Link href={`/dashboard/properties/${property.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Property
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Property Details */}
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium capitalize">{property.property_type}</span>
              </div>

              {property.bedrooms && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bedrooms:</span>
                  <div className="flex items-center">
                    <Bed className="h-4 w-4 mr-1" />
                    {property.bedrooms}
                  </div>
                </div>
              )}

              {property.bathrooms && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bathrooms:</span>
                  <div className="flex items-center">
                    <Bath className="h-4 w-4 mr-1" />
                    {property.bathrooms}
                  </div>
                </div>
              )}

              {property.square_feet && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Square Feet:</span>
                  <div className="flex items-center">
                    <Square className="h-4 w-4 mr-1" />
                    {property.square_feet.toLocaleString()}
                  </div>
                </div>
              )}

              <Separator />

              {property.monthly_rent && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Rent:</span>
                  <div className="flex items-center font-medium text-primary">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {property.monthly_rent.toLocaleString()}
                  </div>
                </div>
              )}

              {property.deposit_amount && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Security Deposit:</span>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {property.deposit_amount.toLocaleString()}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(property.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Tenants */}
        <Card>
          <CardHeader>
            <CardTitle>Current Tenants</CardTitle>
            <CardDescription>
              {tenants && tenants.length > 0 ? `${tenants.length} active tenant(s)` : "No active tenants"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tenants && tenants.length > 0 ? (
              <div className="space-y-3">
                {tenants.map((tenant) => (
                  <div key={tenant.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">
                        {tenant.first_name} {tenant.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">{tenant.email}</div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/tenants/${tenant.id}`}>View</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">No tenants assigned to this property</p>
                <Button asChild>
                  <Link href="/dashboard/tenants/new">Add Tenant</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Description and Amenities */}
      {(property.description || (property.amenities && property.amenities.length > 0)) && (
        <div className="grid gap-6 md:grid-cols-2">
          {property.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{property.description}</p>
              </CardContent>
            </Card>
          )}

          {property.amenities && property.amenities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
