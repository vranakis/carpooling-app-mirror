"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Car, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function VerifyPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate verification
    setTimeout(() => {
      setIsLoading(false)
      setIsVerified(true)
    }, 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <Car className="h-8 w-8 text-emerald-500" />
            <span className="font-bold text-2xl">Easy Rider Athens</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Verify your account</CardTitle>
            <CardDescription>
              We've sent a verification code to your email. Please enter it below to verify your account.
            </CardDescription>
          </CardHeader>
          {!isVerified ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Verification code</Label>
                  <Input id="code" placeholder="Enter 6-digit code" required />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify account"}
                </Button>
                <div className="text-center text-sm">
                  Didn't receive a code?{" "}
                  <button type="button" className="text-emerald-600 hover:text-emerald-700 font-medium">
                    Resend code
                  </button>
                </div>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="flex flex-col items-center py-6">
              <CheckCircle className="h-16 w-16 text-emerald-500 mb-4" />
              <h3 className="text-xl font-medium mb-2">Account verified!</h3>
              <p className="text-gray-500 text-center mb-6">
                Your account has been successfully verified. You can now start using RideShare.
              </p>
              <Button asChild className="w-full bg-emerald-500 hover:bg-emerald-600">
                <Link href="/">Continue to dashboard</Link>
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
