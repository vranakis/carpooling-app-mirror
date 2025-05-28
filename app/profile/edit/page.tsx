"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import AppHeader from "@/components/app-header"
import { useAuth } from "@/components/auth-provider"
import { useState, useEffect } from "react"
import { updateProfile } from "@/lib/actions/profile"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function EditProfilePage() {
  const { profile, isLoading } = useAuth()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    bio: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
      })
    }
  }, [profile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    const form = new FormData()
    form.append("firstName", formData.firstName)
    form.append("lastName", formData.lastName)
    form.append("phone", formData.phone)
    form.append("bio", formData.bio)

    const result = await updateProfile(form)

    setIsSaving(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success("Profile updated successfully")
    router.push("/profile")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <p className="text-center">Loading profile...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Link href="/profile" className="flex items-center text-emerald-600 mb-6">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to profile
          </Link>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Edit Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+30 69 1234 5678"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  <p className="text-sm text-gray-500">
                    Your phone number is only shared with riders after booking confirmation
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">About me</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    placeholder="Tell others about yourself..."
                    rows={5}
                    value={formData.bio}
                    onChange={handleChange}
                  />
                  <p className="text-sm text-gray-500">
                    Share a bit about yourself to help others feel comfortable riding with you
                  </p>
                </div>

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" asChild>
                    <Link href="/profile">Cancel</Link>
                  </Button>
                  <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
