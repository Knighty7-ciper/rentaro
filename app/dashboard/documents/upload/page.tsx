import { DocumentUploadForm } from "@/components/document-upload-form"

export default function UploadDocumentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Upload Document</h1>
        <p className="text-muted-foreground">Add a new document to your property management system</p>
      </div>

      <DocumentUploadForm />
    </div>
  )
}
