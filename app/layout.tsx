import type React from "react"
import type { Metadata } from "next"
import { Montserrat, Orbitron } from "next/font/google"
import "./globals.css"

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["400", "600", "700", "900"],
})

const orbitron = Orbitron({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-orbitron",
  weight: ["400", "700", "900"],
})

export const metadata: Metadata = {
  title: "Rentaro | Property Management Platform",
  description: "Professional property management system for managing properties, tenants, finances, and maintenance.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${orbitron.variable} antialiased dark`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
