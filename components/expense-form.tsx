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

interface ExpenseFormProps {
  expense?: any
  isEditing?: boolean
}

export function ExpenseForm({ expense, isEditing = false }: ExpenseFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [properties, setProperties] = useState<any[]>([])
  const [formData, setFormData] = useState({
    property_id: expense?.property_id || "general",
    category: expense?.category || "maintenance",
    description: expense?.description || "",
    amount: expense?.amount || "",
    expense_date: expense?.expense_date || new Date().toISOString().split("T")[0],
    vendor: expense?.vendor || "",
    is_recurring: expense?.is_recurring || false,
    recurring_frequency: expense?.recurring_frequency || "",
    notes: expense?.notes || "",
  })

  // Fetch properties for dropdown
  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase.from("properties").select("id, name, address").order("name")

      if (error) {
        console.error("Error fetching properties:", error)
      } else {
        setProperties(data || [])
      }
    }

    fetchProperties()
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

      const expenseData = {
        ...formData,
        user_id: user.id,
        amount: formData.amount ? Number.parseFloat(formData.amount) : null,
        property_id: formData.property_id === "general" ? null : formData.property_id || null,
        recurring_frequency: formData.is_recurring ? formData.recurring_frequency : null,
      }

      let error
      if (isEditing && expense) {
        const { error: updateError } = await supabase.from("expenses").update(expenseData).eq("id", expense.id)
        error = updateError
      } else {
        const { error: insertError } = await supabase.from("expenses").insert([expenseData])
        error = insertError
      }

      if (error) throw error

      router.push("/dashboard/finances")
      router.refresh()
    } catch (error) {
      console.error("Error saving expense:", error)
      alert("Error saving expense. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const expenseCategories = [
    "Maintenance",
    "Utilities",
    "Insurance",
    "Property Taxes",
    "Property Management",
    "Advertising",
    "Legal & Professional",
    "Repairs",
    "Supplies",
    "Travel",
    "Security",
    "Cleaning",
    "Other",
  ]

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Expense" : "Expense Information"}</CardTitle>
        <CardDescription>{isEditing ? "Update the expense details" : "Record a new property expense"}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category} value={category.toLowerCase().replace(/ & /g, "_").replace(/ /g, "_")}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="property_id">Property</Label>
              <Select value={formData.property_id} onValueChange={(value) => handleChange("property_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Expense</SelectItem>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Brief description of the expense"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (KSH) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                placeholder="0.00"
                required
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense_date">Expense Date *</Label>
              <Input
                id="expense_date"
                type="date"
                value={formData.expense_date}
                onChange={(e) => handleChange("expense_date", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor">Vendor/Payee</Label>
            <Input
              id="vendor"
              value={formData.vendor}
              onChange={(e) => handleChange("vendor", e.target.value)}
              placeholder="Company or person paid"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_recurring"
                checked={formData.is_recurring}
                onCheckedChange={(checked) => handleChange("is_recurring", checked as boolean)}
              />
              <Label htmlFor="is_recurring">This is a recurring expense</Label>
            </div>

            {formData.is_recurring && (
              <div className="space-y-2">
                <Label htmlFor="recurring_frequency">Frequency</Label>
                <Select
                  value={formData.recurring_frequency}
                  onValueChange={(value) => handleChange("recurring_frequency", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Additional notes about this expense..."
              rows={3}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Recording..."}
                </>
              ) : (
                <>{isEditing ? "Update Expense" : "Record Expense"}</>
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
