"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Upload, Shield } from "lucide-react"
import Link from "next/link"
import AppHeader from "@/components/app-header"

export default function VerificationPage() {
  const [idVerified, setIdVerified] = useState(false)
  const [licenseVerified, setLicenseVerified] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleIdUpload = () => {
    setIsUploading(true)
    // Simulate upload and verification
    setTimeout(() => {
      setIsUploading(false)
      setIdVerified(true)
    }, 2000)
  }

  const handleLicenseUpload = () => {
    setIsUploading(true)
    // Simulate upload and verification
    setTimeout(() => {
      setIsUploading(false)
      setLicenseVerified(true)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Link href="/profile" className="text-emerald-600 mb-6 inline-block">
            ← Back to profile
          </Link>

          <h1 className="text-3xl font-bold mb-6">Account Verification</h1>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start">
            <Shield className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-800">Why verify your account?</h3>
              <p className="text-blue-700 text-sm mt-1">
                Verification helps build trust in our community. Verified members are more likely to be chosen for rides
                and can access all platform features.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span>ID Verification</span>
                  {idVerified && <CheckCircle className="h-5 w-5 text-emerald-500 ml-2" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!idVerified ? (
                  <div>
                    <p className="text-gray-500 mb-4">
                      Please upload a photo of your government-issued ID (passport, national ID card, etc.)
                    </p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-4">
                        Drag and drop your ID photo here, or click to browse files
                      </p>
                      <Input type="file" accept="image/*" className="hidden" id="id-upload" onChange={handleIdUpload} />
                      <Label htmlFor="id-upload" className="cursor-pointer">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("id-upload")?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? "Uploading..." : "Upload ID"}
                        </Button>
                      </Label>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-emerald-500 mr-3" />
                    <div>
                      <p className="font-medium">ID successfully verified</p>
                      <p className="text-sm text-gray-500">Verified on May 22, 2025</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span>Driver's License Verification</span>
                  {licenseVerified && <CheckCircle className="h-5 w-5 text-emerald-500 ml-2" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!licenseVerified ? (
                  <div>
                    <p className="text-gray-500 mb-4">
                      If you plan to offer rides, please upload a photo of your driver's license
                    </p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-4">
                        Drag and drop your license photo here, or click to browse files
                      </p>
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="license-upload"
                        onChange={handleLicenseUpload}
                      />
                      <Label htmlFor="license-upload" className="cursor-pointer">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("license-upload")?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? "Uploading..." : "Upload License"}
                        </Button>
                      </Label>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-emerald-500 mr-3" />
                    <div>
                      <p className="font-medium">Driver's license successfully verified</p>
                      <p className="text-sm text-gray-500">Verified on May 22, 2025</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                className="bg-emerald-500 hover:bg-emerald-600"
                disabled={!idVerified && !licenseVerified}
                asChild
              >
                <Link href="/profile">Save and continue</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
