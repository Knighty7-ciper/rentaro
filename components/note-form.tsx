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
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

interface NoteFormProps {
  note?: any
  isEditing?: boolean
}

export function NoteForm({ note, isEditing = false }: NoteFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [properties, setProperties] = useState<any[]>([])
  const [tenants, setTenants] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: note?.title || "",
    content: note?.content || "",
    category: note?.category || "general",
    property_id: note?.property_id || "none",
    tenant_id: note?.tenant_id || "none",
    is_pinned: note?.is_pinned || false,
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

      const noteData = {
        ...formData,
        user_id: user.id,
        property_id: formData.property_id === "none" ? null : formData.property_id || null,
        tenant_id: formData.tenant_id === "none" ? null : formData.tenant_id || null,
      }

      let error
      if (isEditing && note) {
        const { error: updateError } = await supabase.from("notes").update(noteData).eq("id", note.id)
        error = updateError
      } else {
        const { error: insertError } = await supabase.from("notes").insert([noteData])
        error = insertError
      }

      if (error) throw error

      router.push("/dashboard/notes")
      router.refresh()
    } catch (error) {
      console.error("Error saving note:", error)
      alert("Error saving note. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Note" : "New Note"}</CardTitle>
        <CardDescription>{isEditing ? "Update your note" : "Create a new note or reminder"}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title (Optional)</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Note title..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleChange("content", e.target.value)}
              placeholder="Write your note here..."
              rows={6}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="property_id">Property (Optional)</Label>
              <Select value={formData.property_id} onValueChange={(value) => handleChange("property_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific property</SelectItem>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
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
                  <SelectItem value="none">No specific tenant</SelectItem>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.first_name} {tenant.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_pinned"
              checked={formData.is_pinned}
              onCheckedChange={(checked) => handleChange("is_pinned", checked as boolean)}
            />
            <Label htmlFor="is_pinned">Pin this note to the top</Label>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{isEditing ? "Update Note" : "Create Note"}</>
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
