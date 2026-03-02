"use client"

import { PropertyForm } from "@/components/property-form"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface EditPropertyPageProps {
  params: {
    id: string
  }
}

export default function EditPropertyPage({ params }: EditPropertyPageProps) {
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase.from("properties").select("*").eq("id", params.id).single()
        setProperty(data)
      } catch (error) {
        console.log("[v0] Error fetching property")
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()
  }, [params.id])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!property) {
    return <div>Property not found</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Edit Property</h1>
        <p className="text-muted-foreground">Update the details for {property.name}</p>
      </div>

      <PropertyForm property={property} isEditing={true} />
    </div>
  )
}
