import { MaintenanceForm } from "@/components/maintenance-form"

export default function NewMaintenancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create Maintenance Request</h1>
        <p className="text-muted-foreground">Report a new maintenance issue or work order</p>
      </div>

      <MaintenanceForm />
    </div>
  )
}
