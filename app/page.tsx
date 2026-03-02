import { Button } from "@/components/ui/button"
import { Building2, Users, DollarSign, Wrench } from "lucide-react"
import Link from "next/link"

export default function HomePage() {

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-6 py-32 sm:py-48 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-6xl font-bold text-foreground mb-4">Rentaro</h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Stop juggling spreadsheets and notebooks. Rentaro lets you manage all your properties in one place. Track tenants, collect rent, handle maintenance, and actually make sense of your finances.
            </p>
            <div className="flex gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link href="/auth/sign-up">Start Free</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1460925895917-adf4e565db18?w=600&q=80" 
              alt="Dashboard with graphs and analytics"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* What You Get Section */}
      <div className="bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-foreground mb-4">What you can do with Rentaro</h2>
          <p className="text-lg text-muted-foreground mb-16">Everything you need to run your rental business</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Manage Properties */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <Building2 className="h-12 w-12 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-3">Manage Your Properties</h3>
                <img 
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80" 
                  alt="Property portfolio view"
                  className="w-full rounded-lg mb-3 h-48 object-cover"
                />
                <p className="text-muted-foreground">
                  Store all property details in one spot. Track rents, add photos, list amenities. Whether it's a bedsitter or a whole apartment complex, it's all organized and searchable.
                </p>
              </div>
            </div>

            {/* Tenant Tracking */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <Users className="h-12 w-12 text-secondary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-3">Keep Tenants Organized</h3>
                <img 
                  src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80" 
                  alt="Apartment keys and living space"
                  className="w-full rounded-lg mb-3 h-48 object-cover"
                />
                <p className="text-muted-foreground">
                  Store tenant info, lease dates, phone numbers, ID details. Never lose track of who owes what or when leases end. See all their payment history too.
                </p>
              </div>
            </div>

            {/* Money Management */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <DollarSign className="h-12 w-12 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-3">Track Every Shilling</h3>
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80" 
                  alt="Financial charts and data"
                  className="w-full rounded-lg mb-3 h-48 object-cover"
                />
                <p className="text-muted-foreground">
                  Log rent paid in KSH, record expenses, generate reports. Know exactly how much you're making each month, what you're spending on maintenance, and see your actual profit.
                </p>
              </div>
            </div>

            {/* Maintenance */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <Wrench className="h-12 w-12 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-3">Handle Maintenance Like a Boss</h3>
                <img 
                  src="https://images.unsplash.com/photo-1621905167918-48416bd8575a?w=400&q=80" 
                  alt="Repair and maintenance tools"
                  className="w-full rounded-lg mb-3 h-48 object-cover"
                />
                <p className="text-muted-foreground">
                  Log maintenance requests, assign contractors, track costs. Tenants report an issue, you see it immediately and know exactly who's handling it and what it'll cost.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="text-4xl font-bold text-foreground mb-6">Ready to stop managing properties with a notebook?</h2>
        <Button asChild size="lg" className="bg-primary hover:bg-primary/90 px-8">
          <Link href="/auth/sign-up">Create Your Account Now</Link>
        </Button>
      </div>
    </div>
  )
}
