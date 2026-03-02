"use client"

import { TenantForm } from "@/components/tenant-form"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface EditTenantPageProps {
  params: {
    id: string
  }
}

export default function EditTenantPage({ params }: EditTenantPageProps) {
  const [tenant, setTenant] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase.from("tenants").select("*").eq("id", params.id).single()
        setTenant(data)
      } catch (error) {
        console.log("[v0] Error fetching tenant")
      } finally {
        setLoading(false)
      }
    }

    fetchTenant()
  }, [params.id])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!tenant) {
    return <div>Tenant not found</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Edit Tenant</h1>
        <p className="text-muted-foreground">
          Update the details for {tenant.first_name} {tenant.last_name}
        </p>
      </div>

      <TenantForm tenant={tenant} isEditing={true} />
    </div>
  )
}
