"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, FileText, ImageIcon, File, Download, Eye } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from("documents")
          .select(`
            *,
            properties (name, address),
            tenants (first_name, last_name)
          `)
          .order("created_at", { ascending: false })

        setDocuments(data || [])
      } catch (error) {
        console.log("[v0] Error fetching documents")
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [])

  const leaseDocuments = documents?.filter((doc) => doc.document_type === "lease") || []
  const insuranceDocuments = documents?.filter((doc) => doc.document_type === "insurance") || []
  const inspectionDocuments = documents?.filter((doc) => doc.document_type === "inspection") || []
  const photoDocuments = documents?.filter((doc) => doc.document_type === "photo") || []
  const otherDocuments =
    documents?.filter((doc) => !["lease", "insurance", "inspection", "photo"].includes(doc.document_type)) || []

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case "lease":
        return "bg-primary text-primary-foreground"
      case "insurance":
        return "bg-chart-4 text-white"
      case "inspection":
        return "bg-secondary text-secondary-foreground"
      case "photo":
        return "bg-chart-2 text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.startsWith("image/")) {
      return <ImageIcon className="h-4 w-4" />
    }
    return <FileText className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const DocumentCard = ({ document }: { document: any }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {getFileIcon(document.mime_type)}
              {document.title}
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {document.properties && `${document.properties.name} • `}
              {document.tenants && `${document.tenants.first_name} ${document.tenants.last_name} • `}
              {formatDate(document.created_at)}
            </div>
          </div>
          <Badge className={getDocumentTypeColor(document.document_type)}>{document.document_type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">File Size:</span>
          <span>{document.file_size ? formatFileSize(document.file_size) : "Unknown"}</span>
        </div>

        {document.notes && <p className="text-sm text-muted-foreground line-clamp-2">{document.notes}</p>}

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Documents</h1>
          <p className="text-muted-foreground">Manage property documents, leases, and files</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/dashboard/documents/upload">
            <Plus className="h-4 w-4 mr-2" />
            Upload Document
          </Link>
        </Button>
      </div>

      {/* Document Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Documents</CardTitle>
            <File className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{documents?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Leases</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{leaseDocuments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Insurance</CardTitle>
            <FileText className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-4">{insuranceDocuments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inspections</CardTitle>
            <FileText className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{inspectionDocuments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Photos</CardTitle>
            <ImageIcon className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">{photoDocuments.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different document types */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Documents ({documents?.length || 0})</TabsTrigger>
          <TabsTrigger value="leases">Leases ({leaseDocuments.length})</TabsTrigger>
          <TabsTrigger value="insurance">Insurance ({insuranceDocuments.length})</TabsTrigger>
          <TabsTrigger value="inspections">Inspections ({inspectionDocuments.length})</TabsTrigger>
          <TabsTrigger value="photos">Photos ({photoDocuments.length})</TabsTrigger>
          <TabsTrigger value="other">Other ({otherDocuments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {documents && documents.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {documents.map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No documents uploaded yet</p>
                <Button asChild>
                  <Link href="/dashboard/documents/upload">
                    <Plus className="h-4 w-4 mr-2" />
                    Upload First Document
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="leases" className="space-y-4">
          {leaseDocuments.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {leaseDocuments.map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No lease documents found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insurance" className="space-y-4">
          {insuranceDocuments.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {insuranceDocuments.map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No insurance documents found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="inspections" className="space-y-4">
          {inspectionDocuments.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {inspectionDocuments.map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No inspection documents found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="photos" className="space-y-4">
          {photoDocuments.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {photoDocuments.map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No photos found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="other" className="space-y-4">
          {otherDocuments.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {otherDocuments.map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No other documents found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
