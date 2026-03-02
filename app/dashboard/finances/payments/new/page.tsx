import { PaymentForm } from "@/components/payment-form"

export default function NewPaymentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Record Rent Payment</h1>
        <p className="text-muted-foreground">Add a new rent payment record</p>
      </div>

      <PaymentForm />
    </div>
  )
}
