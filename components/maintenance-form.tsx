"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

interface MaintenanceFormProps {
  maintenanceRequest?: any
  isEditing?: boolean
}

export function MaintenanceForm({ maintenanceRequest, isEditing = false }: MaintenanceFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [properties, setProperties] = useState<any[]>([])
  const [tenants, setTenants] = useState<any[]>([])
  const [formData, setFormData] = useState({
    property_id: maintenanceRequest?.property_id || "default_property_id",
    tenant_id: maintenanceRequest?.tenant_id || "",
    title: maintenanceRequest?.title || "",
    description: maintenanceRequest?.description || "",
    priority: maintenanceRequest?.priority || "medium",
    status: maintenanceRequest?.status || "open",
    category: maintenanceRequest?.category || "general",
    estimated_cost: maintenanceRequest?.estimated_cost || "",
    actual_cost: maintenanceRequest?.actual_cost || "",
    contractor_name: maintenanceRequest?.contractor_name || "",
    contractor_phone: maintenanceRequest?.contractor_phone || "",
    scheduled_date: maintenanceRequest?.scheduled_date || "",
    completed_date: maintenanceRequest?.completed_date || "",
    notes: maintenanceRequest?.notes || "",
  })

  // Fetch properties and tenants for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      const [propertiesResult, tenantsResult] = await Promise.all([
        supabase.from("properties").select("id, name, address").order("name"),
        supabase
          .from("tenants")
          .select("id, first_name, last_name, property_id")
          .eq("status", "active")
          .order("first_name"),
      ])

      if (propertiesResult.error) {
        console.error("Error fetching properties:", propertiesResult.error)
      } else {
        setProperties(propertiesResult.data || [])
      }

      if (tenantsResult.error) {
        console.error("Error fetching tenants:", tenantsResult.error)
      } else {
        setTenants(tenantsResult.data || [])
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not authenticated")
      }

      const maintenanceData = {
        ...formData,
        user_id: user.id,
        estimated_cost: formData.estimated_cost ? Number.parseFloat(formData.estimated_cost) : null,
        actual_cost: formData.actual_cost ? Number.parseFloat(formData.actual_cost) : null,
        property_id: formData.property_id || null,
        tenant_id: formData.tenant_id || null,
        scheduled_date: formData.scheduled_date || null,
        completed_date: formData.completed_date || null,
      }

      let error
      if (isEditing && maintenanceRequest) {
        const { error: updateError } = await supabase
          .from("maintenance_requests")
          .update(maintenanceData)
          .eq("id", maintenanceRequest.id)
        error = updateError
      } else {
        const { error: insertError } = await supabase.from("maintenance_requests").insert([maintenanceData])
        error = insertError
      }

      if (error) throw error

      router.push("/dashboard/maintenance")
      router.refresh()
    } catch (error) {
      console.error("Error saving maintenance request:", error)
      alert("Error saving maintenance request. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const categories = [
    "General",
    "Plumbing",
    "Electrical",
    "HVAC",
    "Appliance",
    "Flooring",
    "Painting",
    "Roofing",
    "Windows/Doors",
    "Landscaping",
    "Security",
    "Other",
  ]

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Maintenance Request" : "Maintenance Request Details"}</CardTitle>
        <CardDescription>
          {isEditing ? "Update the maintenance request information" : "Fill in the details for the maintenance request"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="property_id">Property *</Label>
              <Select value={formData.property_id} onValueChange={(value) => handleChange("property_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name} - {property.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant_id">Tenant (Optional)</Label>
              <Select value={formData.tenant_id} onValueChange={(value) => handleChange("tenant_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tenant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_tenant">No specific tenant</SelectItem>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.first_name} {tenant.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Brief description of the issue"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Detailed description of the maintenance issue..."
              rows={4}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select value={formData.priority} onValueChange={(value) => handleChange("priority", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="estimated_cost">Estimated Cost ($)</Label>
              <Input
                id="estimated_cost"
                type="number"
                step="0.01"
                value={formData.estimated_cost}
                onChange={(e) => handleChange("estimated_cost", e.target.value)}
                placeholder="0.00"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actual_cost">Actual Cost ($)</Label>
              <Input
                id="actual_cost"
                type="number"
                step="0.01"
                value={formData.actual_cost}
                onChange={(e) => handleChange("actual_cost", e.target.value)}
                placeholder="0.00"
                min="0"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contractor_name">Contractor Name</Label>
              <Input
                id="contractor_name"
                value={formData.contractor_name}
                onChange={(e) => handleChange("contractor_name", e.target.value)}
                placeholder="Contractor or company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contractor_phone">Contractor Phone</Label>
              <Input
                id="contractor_phone"
                value={formData.contractor_phone}
                onChange={(e) => handleChange("contractor_phone", e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="scheduled_date">Scheduled Date</Label>
              <Input
                id="scheduled_date"
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => handleChange("scheduled_date", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="completed_date">Completed Date</Label>
              <Input
                id="completed_date"
                type="date"
                value={formData.completed_date}
                onChange={(e) => handleChange("completed_date", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Additional notes, updates, or instructions..."
              rows={3}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{isEditing ? "Update Request" : "Create Request"}</>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
