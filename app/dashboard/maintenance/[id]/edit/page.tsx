"use client"

import { MaintenanceForm } from "@/components/maintenance-form"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface EditMaintenancePageProps {
  params: {
    id: string
  }
}

export default function EditMaintenancePage({ params }: EditMaintenancePageProps) {
  const [maintenanceRequest, setMaintenanceRequest] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from("maintenance_requests")
          .select("*")
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
    return <div>Loading...</div>
  }

  if (!maintenanceRequest) {
    return <div>Maintenance request not found</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Edit Maintenance Request</h1>
        <p className="text-muted-foreground">Update the details for "{maintenanceRequest.title}"</p>
      </div>

      <MaintenanceForm maintenanceRequest={maintenanceRequest} isEditing={true} />
    </div>
  )
}
