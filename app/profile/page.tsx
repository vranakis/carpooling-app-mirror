import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Car, Edit, MapPin, Shield, Star } from "lucide-react"
import Link from "next/link"
import { getCurrentUser } from "@/lib/actions/auth"
import { getEnvironmentalImpact } from "@/lib/actions/profile"
import { redirect } from "next/navigation"
import VehiclesList from "@/components/vehicles-list"
import { Suspense } from "react"

function SuccessMessage({ searchParams }: { searchParams: { success?: string; error?: string } }) {
  if (searchParams.success === "vehicle-added") {
    return (
      <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
        <p className="text-emerald-800 font-medium">✅ Vehicle added successfully!</p>
      </div>
    )
  }

  if (searchParams.error) {
    return (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 font-medium">❌ Error: {decodeURIComponent(searchParams.error)}</p>
      </div>
    )
  }

  return null
}

export default async function ProfilePage({
  searchParams,
}: { searchParams: { tab?: string; success?: string; error?: string } }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login?redirect=/profile")
  }

  const impact = await getEnvironmentalImpact()

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-6">
        <Suspense fallback={null}>
          <SuccessMessage searchParams={searchParams} />
        </Suspense>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 md:mb-8 flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-center">
            <Avatar className="h-20 w-20 md:h-24 md:w-24">
              <AvatarFallback className="bg-emerald-100 text-emerald-700 text-2xl">
                {user.first_name?.[0]}
                {user.last_name?.[0]}
              </AvatarFallback>
              <AvatarImage src={user.avatar_url || "/placeholder.svg?height=96&width=96"} />
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold">
                {user.first_name} {user.last_name}
              </h1>
              <div className="flex items-center justify-center md:justify-start mt-1 text-gray-500">
                <MapPin className="h-4 w-4 mr-1" />
                Athens, Greece
              </div>
              <div className="flex items-center justify-center md:justify-start mt-1">
                <Star className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" />
                <span className="font-medium">{user.rating || "New"}</span>
                <span className="text-gray-500 ml-1">({user.review_count || 0} reviews)</span>
                <span className="mx-2 text-gray-300">•</span>
                <span className="text-gray-500">
                  Member since{" "}
                  {new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
              </div>
              <div className="flex items-center justify-center md:justify-start mt-2 flex-wrap gap-2">
                {user.is_verified && (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    <Shield className="h-3 w-3 mr-1" /> Verified
                  </Badge>
                )}
                {user.is_id_verified && (
                  <Badge variant="outline" className="bg-gray-50">
                    ID Verified
                  </Badge>
                )}
                {user.is_license_verified && (
                  <Badge variant="outline" className="bg-gray-50">
                    <Car className="h-3 w-3 mr-1" /> License Verified
                  </Badge>
                )}
              </div>
            </div>
            <Button className="bg-emerald-500 hover:bg-emerald-600 w-full md:w-auto" asChild>
              <Link href="/profile/edit">
                <Edit className="h-4 w-4 mr-2" /> Edit profile
              </Link>
            </Button>
          </div>

          <Tabs defaultValue={searchParams.tab || "profile"} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4 md:mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
              <TabsTrigger value="impact">Impact</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-4 md:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About me</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-sm md:text-base">{user.bio || "No bio provided yet."}</p>
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Contact Information</h3>
                    <div className="space-y-1 text-gray-600 text-sm md:text-base">
                      <p>Email: {user.email}</p>
                      <p>Phone: {user.phone || "Not provided"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Verification Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          user.is_id_verified ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        <Shield className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">ID Verification</div>
                        <div className="text-sm text-gray-500">{user.is_id_verified ? "Verified" : "Not verified"}</div>
                      </div>
                    </div>
                    {!user.is_id_verified && (
                      <Button asChild size="sm">
                        <Link href="/profile/verification">Verify now</Link>
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          user.is_license_verified ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        <Car className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">Driver's License</div>
                        <div className="text-sm text-gray-500">
                          {user.is_license_verified ? "Verified" : "Not verified"}
                        </div>
                      </div>
                    </div>
                    {!user.is_license_verified && (
                      <Button asChild size="sm">
                        <Link href="/profile/verification">Verify now</Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Reviews</CardTitle>
                    <Link href="/profile/reviews" className="text-sm text-emerald-600 hover:underline">
                      View all reviews
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-6 text-center">
                    <p className="text-gray-500 text-sm">Reviews will appear here once you've completed some rides.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Vehicles Tab */}
            <TabsContent value="vehicles" className="space-y-4 md:space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg md:text-xl font-semibold">Your vehicles</h2>
                <Button className="bg-emerald-500 hover:bg-emerald-600" asChild size="sm">
                  <Link href="/profile/vehicles/add">+ Add vehicle</Link>
                </Button>
              </div>

              <VehiclesList />
            </TabsContent>

            {/* Environmental Impact Tab */}
            <TabsContent value="impact" className="space-y-4 md:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Environmental Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6">
                    <div className="bg-emerald-50 p-4 rounded-lg">
                      <div className="text-emerald-600 font-medium">CO₂ Saved</div>
                      <div className="text-xl md:text-2xl font-bold">{impact?.co2_saved || 0} kg</div>
                      <div className="text-sm text-gray-500">By sharing your commute</div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-blue-600 font-medium">Rides Shared</div>
                      <div className="text-xl md:text-2xl font-bold">{impact?.rides_shared || 0}</div>
                      <div className="text-sm text-gray-500">Total shared commutes</div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-purple-600 font-medium">People Helped</div>
                      <div className="text-xl md:text-2xl font-bold">{impact?.people_helped || 0}</div>
                      <div className="text-sm text-gray-500">Commuters you've helped</div>
                    </div>
                  </div>

                  <div className="text-center">
                    <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                      <Link href="/impact">View detailed impact</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
