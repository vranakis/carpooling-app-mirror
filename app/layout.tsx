import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import AppHeader from "@/components/app-header"
import AuthProvider from "@/components/auth-provider"
import AuthDebug from "@/components/auth-debug"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "RideShare - Sustainable Carpooling",
  description: "Connect with others for eco-friendly rides",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AppHeader />
          <main className="min-h-screen bg-gray-50">{children}</main>
          <AuthDebug />
        </AuthProvider>
      </body>
    </html>
  )
}
