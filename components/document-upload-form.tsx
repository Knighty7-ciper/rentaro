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
import { Loader2, Upload, File } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

export function DocumentUploadForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [properties, setProperties] = useState<any[]>([])
  const [tenants, setTenants] = useState<any[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    document_type: "other",
    property_id: "",
    tenant_id: "",
    notes: "",
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Auto-fill title if empty
      if (!formData.title) {
        const fileName = file.name.replace(/\.[^/.]+$/, "") // Remove extension
        setFormData((prev) => ({ ...prev, title: fileName }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      alert("Please select a file to upload")
      return
    }

    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not authenticated")
      }

      // For demo purposes, we'll create a placeholder file URL
      // In a real implementation, you would upload to Supabase Storage or another service
      const fileUrl = `/placeholder-documents/${selectedFile.name}`

      const documentData = {
        ...formData,
        user_id: user.id,
        file_url: fileUrl,
        file_size: selectedFile.size,
        mime_type: selectedFile.type,
        property_id: formData.property_id === "none" ? null : formData.property_id || null,
        tenant_id: formData.tenant_id === "none" ? null : formData.tenant_id || null,
      }

      const { error } = await supabase.from("documents").insert([documentData])

      if (error) throw error

      router.push("/dashboard/documents")
      router.refresh()
    } catch (error) {
      console.error("Error uploading document:", error)
      alert("Error uploading document. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const documentTypes = [
    { value: "lease", label: "Lease Agreement" },
    { value: "insurance", label: "Insurance Document" },
    { value: "inspection", label: "Inspection Report" },
    { value: "photo", label: "Property Photo" },
    { value: "receipt", label: "Receipt/Invoice" },
    { value: "contract", label: "Contract" },
    { value: "certificate", label: "Certificate" },
    { value: "other", label: "Other" },
  ]

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Document Upload</CardTitle>
        <CardDescription>Upload and organize your property-related documents</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Select File *</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <input
                id="file"
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
              />
              <label htmlFor="file" className="cursor-pointer">
                <div className="space-y-2">
                  {selectedFile ? (
                    <>
                      <File className="h-8 w-8 mx-auto text-primary" />
                      <div className="text-sm font-medium">{selectedFile.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <div className="text-sm font-medium">Click to upload a file</div>
                      <div className="text-xs text-muted-foreground">PDF, DOC, DOCX, JPG, PNG, GIF, TXT (Max 10MB)</div>
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Document Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Enter document title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="document_type">Document Type *</Label>
              <Select value={formData.document_type} onValueChange={(value) => handleChange("document_type", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="property_id">Associated Property (Optional)</Label>
              <Select value={formData.property_id} onValueChange={(value) => handleChange("property_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific property</SelectItem>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name} - {property.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant_id">Associated Tenant (Optional)</Label>
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

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Additional notes about this document..."
              rows={3}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading || !selectedFile} className="bg-primary hover:bg-primary/90">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </>
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
