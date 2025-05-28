import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Car } from "lucide-react"
import Link from "next/link"
import { createVehicle } from "@/lib/actions/vehicles"
import { getCurrentUser } from "@/lib/actions/auth"
import { redirect } from "next/navigation"

export default async function AddVehiclePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login?redirect=/profile/vehicles/add")
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i)

  async function handleCreateVehicle(formData: FormData) {
    "use server"

    try {
      await createVehicle(formData)
    } catch (error) {
      console.error("Error in form submission:", error)
      // In a real app, you'd want to show this error to the user
      // For now, we'll redirect to an error state
      redirect("/profile?tab=vehicles&error=" + encodeURIComponent((error as Error).message))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link
              href="/profile?tab=vehicles"
              className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to vehicles
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold">Add a Vehicle</h1>
            <p className="text-gray-600 mt-2">Add your car to start offering rides</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Vehicle Information
              </CardTitle>
              <CardDescription>
                Please provide accurate information about your vehicle. This helps passengers identify your car.
              </CardDescription>
            </CardHeader>

            <form action={handleCreateVehicle}>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="make">Make *</Label>
                    <Input id="make" name="make" placeholder="e.g., Toyota, BMW, Ford" required className="w-full" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">Model *</Label>
                    <Input id="model" name="model" placeholder="e.g., Corolla, X3, Focus" required className="w-full" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Year *</Label>
                    <select
                      id="year"
                      name="year"
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Select year</option>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">Color *</Label>
                    <Input
                      id="color"
                      name="color"
                      placeholder="e.g., White, Black, Silver"
                      required
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="seats">Number of Seats *</Label>
                    <select
                      id="seats"
                      name="seats"
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Select seats</option>
                      <option value="2">2 seats</option>
                      <option value="3">3 seats</option>
                      <option value="4">4 seats</option>
                      <option value="5">5 seats</option>
                      <option value="6">6 seats</option>
                      <option value="7">7 seats</option>
                      <option value="8">8 seats</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fuelType">Fuel Type *</Label>
                    <select
                      id="fuelType"
                      name="fuelType"
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Select fuel type</option>
                      <option value="gasoline">Gasoline</option>
                      <option value="diesel">Diesel</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="electric">Electric</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licensePlate">License Plate *</Label>
                  <Input
                    id="licensePlate"
                    name="licensePlate"
                    placeholder="e.g., ABC-1234"
                    required
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500">This helps passengers identify your vehicle at pickup points</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Why do we need this information?</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Helps passengers identify your car easily</li>
                    <li>• Ensures accurate seat availability for rides</li>
                    <li>• Tracks environmental impact based on fuel type</li>
                    <li>• Provides safety and verification for all users</li>
                  </ul>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" className="flex-1" asChild>
                    <Link href="/profile?tab=vehicles">Cancel</Link>
                  </Button>
                  <Button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-600">
                    Add Vehicle
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      </main>
    </div>
  )
}
