import { PropertyForm } from "@/components/property-form"

export default function NewPropertyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Add New Property</h1>
        <p className="text-muted-foreground">Enter the details for your rental property</p>
      </div>

      <PropertyForm />
    </div>
  )
}
