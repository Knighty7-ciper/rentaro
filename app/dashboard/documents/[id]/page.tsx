"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Eye, Edit, Trash2, FileText, ImageIcon, File } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Document {
  id: string
  title: string
  type: string
  file_url: string
  file_size: number
  property_id?: string
  tenant_id?: string
  uploaded_at: string
  properties?: { address: string }
  tenants?: { full_name: string }
}

export default function DocumentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchDocument()
  }, [params.id])

  const fetchDocument = async () => {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select(`
          *,
          properties(address),
          tenants(full_name)
        `)
        .eq("id", params.id)
        .single()

      if (error) throw error
      setDocument(data)
    } catch (error) {
      console.error("Error fetching document:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this document?")) return

    try {
      const { error } = await supabase.from("documents").delete().eq("id", params.id)

      if (error) throw error
      router.push("/dashboard/documents")
    } catch (error) {
      console.error("Error deleting document:", error)
    }
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="w-5 h-5" />
    if (type.includes("pdf")) return <FileText className="w-5 h-5" />
    return <File className="w-5 h-5" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Document not found</h3>
          <p className="text-slate-500 mb-4">The document you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/dashboard/documents")}>Back to Documents</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/documents")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Documents
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{document.title}</h1>
            <p className="text-slate-500">Uploaded {new Date(document.uploaded_at).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getFileIcon(document.type)}
                Document Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 rounded-lg p-8 text-center">
                {document.type.startsWith("image/") ? (
                  <img
                    src={document.file_url || "/placeholder.svg"}
                    alt={document.title}
                    className="max-w-full h-auto mx-auto rounded-lg"
                  />
                ) : (
                  <div className="space-y-4">
                    {getFileIcon(document.type)}
                    <div>
                      <p className="font-medium text-slate-900">{document.title}</p>
                      <p className="text-sm text-slate-500">
                        {document.type} • {formatFileSize(document.file_size)}
                      </p>
                    </div>
                    <Button>
                      <Eye className="w-4 h-4 mr-2" />
                      Open Document
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Type</label>
                <Badge variant="secondary" className="ml-2">
                  {document.type}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">File Size</label>
                <p className="text-sm text-slate-900">{formatFileSize(document.file_size)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Uploaded</label>
                <p className="text-sm text-slate-900">{new Date(document.uploaded_at).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {(document.properties || document.tenants) && (
            <Card>
              <CardHeader>
                <CardTitle>Associated With</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {document.properties && (
                  <div>
                    <label className="text-sm font-medium text-slate-700">Property</label>
                    <p className="text-sm text-slate-900">{document.properties.address}</p>
                  </div>
                )}
                {document.tenants && (
                  <div>
                    <label className="text-sm font-medium text-slate-700">Tenant</label>
                    <p className="text-sm text-slate-900">{document.tenants.full_name}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
