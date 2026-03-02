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

interface PaymentFormProps {
  payment?: any
  isEditing?: boolean
}

export function PaymentForm({ payment, isEditing = false }: PaymentFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [tenants, setTenants] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [formData, setFormData] = useState({
    tenant_id: payment?.tenant_id || "",
    property_id: payment?.property_id || "",
    amount: payment?.amount || "",
    due_date: payment?.due_date || "",
    paid_date: payment?.paid_date || "",
    payment_method: payment?.payment_method || "",
    status: payment?.status || "pending",
    late_fee: payment?.late_fee || "",
    notes: payment?.notes || "",
  })

  // Fetch tenants and properties for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      const [tenantsResult, propertiesResult] = await Promise.all([
        supabase
          .from("tenants")
          .select("id, first_name, last_name, property_id")
          .eq("status", "active")
          .order("first_name"),
        supabase.from("properties").select("id, name, address").order("name"),
      ])

      if (tenantsResult.error) {
        console.error("Error fetching tenants:", tenantsResult.error)
      } else {
        setTenants(tenantsResult.data || [])
      }

      if (propertiesResult.error) {
        console.error("Error fetching properties:", propertiesResult.error)
      } else {
        setProperties(propertiesResult.data || [])
      }
    }

    fetchData()
  }, [])

  // Auto-select property when tenant is selected
  useEffect(() => {
    if (formData.tenant_id && tenants.length > 0) {
      const selectedTenant = tenants.find((t) => t.id === formData.tenant_id)
      if (selectedTenant?.property_id) {
        setFormData((prev) => ({ ...prev, property_id: selectedTenant.property_id }))
      }
    }
  }, [formData.tenant_id, tenants])

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

      const paymentData = {
        ...formData,
        user_id: user.id,
        amount: formData.amount ? Number.parseFloat(formData.amount) : null,
        late_fee: formData.late_fee ? Number.parseFloat(formData.late_fee) : 0,
        tenant_id: formData.tenant_id || null,
        property_id: formData.property_id || null,
        paid_date: formData.paid_date || null,
      }

      let error
      if (isEditing && payment) {
        const { error: updateError } = await supabase.from("rent_payments").update(paymentData).eq("id", payment.id)
        error = updateError
      } else {
        const { error: insertError } = await supabase.from("rent_payments").insert([paymentData])
        error = insertError
      }

      if (error) throw error

      router.push("/dashboard/finances")
      router.refresh()
    } catch (error) {
      console.error("Error saving payment:", error)
      alert("Error saving payment. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Payment" : "Payment Information"}</CardTitle>
        <CardDescription>{isEditing ? "Update the payment details" : "Record a new rent payment"}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tenant_id">Tenant *</Label>
              <Select value={formData.tenant_id} onValueChange={(value) => handleChange("tenant_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.first_name} {tenant.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="property_id">Property *</Label>
              <Select value={formData.property_id} onValueChange={(value) => handleChange("property_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              <Label htmlFor="late_fee">Late Fee (KSH)</Label>
              <Input
                id="late_fee"
                type="number"
                step="0.01"
                value={formData.late_fee}
                onChange={(e) => handleChange("late_fee", e.target.value)}
                placeholder="0.00"
                min="0"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date *</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => handleChange("due_date", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paid_date">Paid Date</Label>
              <Input
                id="paid_date"
                type="date"
                value={formData.paid_date}
                onChange={(e) => handleChange("paid_date", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select value={formData.payment_method} onValueChange={(value) => handleChange("payment_method", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="mpesa">M-Pesa</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="airtel_money">Airtel Money</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Additional notes about this payment..."
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
                <>{isEditing ? "Update Payment" : "Record Payment"}</>
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
