import { TenantForm } from "@/components/tenant-form"

export default function NewTenantPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Add New Tenant</h1>
        <p className="text-muted-foreground">Enter the details for your new tenant</p>
      </div>

      <TenantForm />
    </div>
  )
}
