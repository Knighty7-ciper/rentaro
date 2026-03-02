"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Building2, MapPin, Bed, Bath, Square } from "lucide-react"
import Link from "next/link"
import { formatKenyaCurrency } from "@/lib/utils"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function PropertiesPage() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from("properties")
          .select("*")
          .order("created_at", { ascending: false })
        
        setProperties(data || [])
      } catch (error) {
        console.log("[v0] Error fetching properties")
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "occupied":
        return "bg-chart-4 text-white"
      case "available":
      case "vacant":
        return "bg-secondary text-secondary-foreground"
      case "maintenance":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-12 md:pt-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Properties</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage your rental properties</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
          <Link href="/dashboard/properties/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Link>
        </Button>
      </div>

      {!properties || properties.length === 0 ? (
        <Card>
          <CardHeader className="text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle className="text-lg md:text-xl">No Properties Yet</CardTitle>
            <CardDescription className="text-sm md:text-base">
              Start by adding your first rental property
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              <Link href="/dashboard/properties/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Property
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Card key={property.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0 flex-1">
                    <CardTitle className="text-base md:text-lg truncate">{property.name}</CardTitle>
                    <div className="flex items-start text-xs md:text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{property.address}</span>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(property.status)} text-xs flex-shrink-0`}>
                    {property.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4 pt-0">
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium capitalize">{property.property_type}</span>
                </div>

                {property.rent_amount && (
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="text-muted-foreground">Monthly Rent:</span>
                    <span className="font-medium text-primary">{formatKenyaCurrency(property.rent_amount)}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
                  {property.bedrooms && (
                    <div className="flex items-center">
                      <Bed className="h-3 w-3 mr-1" />
                      {property.bedrooms}
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center">
                      <Bath className="h-3 w-3 mr-1" />
                      {property.bathrooms}
                    </div>
                  )}
                  {property.size_sqft && (
                    <div className="flex items-center">
                      <Square className="h-3 w-3 mr-1" />
                      {property.size_sqft}
                    </div>
                  )}
                </div>

                {property.description && (
                  <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{property.description}</p>
                )}

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent text-xs md:text-sm">
                    <Link href={`/dashboard/properties/${property.id}`}>View Details</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent text-xs md:text-sm">
                    <Link href={`/dashboard/properties/${property.id}/edit`}>Edit</Link>
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
