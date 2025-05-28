import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Car, MessageSquare, Phone } from "lucide-react"
import Link from "next/link"
import RideMap from "@/components/ride-map"

export default function TrackingPage({ params }: { params: { id: string } }) {
  // This would come from your database and real-time location service in a real app
  const rideData = {
    id: params.id,
    status: "in-progress",
    origin: {
      name: "San Francisco",
      address: "Market Street, near Powell Station",
      time: "Today, 8:00 AM",
      coordinates: [-122.4194, 37.7749],
    },
    destination: {
      name: "Los Angeles",
      address: "Union Station, Downtown LA",
      time: "Today, 1:30 PM",
      coordinates: [-118.2437, 34.0522],
    },
    driver: {
      name: "Michael J.",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.8,
      rides: 124,
      initials: "MJ",
      phone: "+1 (555) 123-4567",
    },
    vehicle: {
      make: "Tesla",
      model: "Model 3",
      color: "White",
      licensePlate: "ABC123",
    },
    // Simulated driver location somewhere along the route
    driverLocation: [-120.5, 36.2],
    estimatedArrival: "12:45 PM",
    distanceRemaining: "180 miles",
    timeRemaining: "2h 15m",
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Car className="h-6 w-6 text-emerald-500" />
            </Link>
            <Link href="/" className="font-bold text-xl">
              RideShare
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/my-rides" className="text-sm font-medium">
              My rides
            </Link>
            <Button size="sm" variant="ghost" className="rounded-full">
              <span className="sr-only">Profile</span>
              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-medium">
                JD
              </div>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/my-rides" className="text-emerald-600 mb-4 inline-block">
            ← Back to my rides
          </Link>

          <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              <Card className="overflow-hidden">
                <div className="h-[400px] w-full">
                  <RideMap
                    originCoordinates={rideData.origin.coordinates}
                    destinationCoordinates={rideData.destination.coordinates}
                    originName={rideData.origin.name}
                    destinationName={rideData.destination.name}
                    driverLocation={rideData.driverLocation}
                  />
                </div>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <div className="w-0.5 h-24 bg-gray-200"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    </div>
                    <div className="flex-1">
                      <div className="mb-8">
                        <div className="font-medium text-lg">{rideData.origin.name}</div>
                        <div className="text-gray-500">{rideData.origin.time}</div>
                        <div className="text-gray-500 mt-1">Pickup: {rideData.origin.address}</div>
                      </div>
                      <div>
                        <div className="font-medium text-lg">{rideData.destination.name}</div>
                        <div className="text-gray-500">{rideData.destination.time}</div>
                        <div className="text-gray-500 mt-1">Dropoff: {rideData.destination.address}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Live tracking</h2>
                    <Badge className="bg-emerald-500">In progress</Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-500">Estimated arrival</div>
                      <div className="font-medium text-lg">{rideData.estimatedArrival}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Distance remaining</div>
                        <div className="font-medium">{rideData.distanceRemaining}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Time remaining</div>
                        <div className="font-medium">{rideData.timeRemaining}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold mb-4">Driver & Vehicle</h2>
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={rideData.driver.avatar || "/placeholder.svg"} alt={rideData.driver.name} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 font-medium">
                        {rideData.driver.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{rideData.driver.name}</div>
                      <div className="text-sm text-gray-500">
                        {rideData.vehicle.color} {rideData.vehicle.make} {rideData.vehicle.model}
                      </div>
                      <div className="text-sm text-gray-500">License plate: {rideData.vehicle.licensePlate}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600">
                      <MessageSquare className="h-4 w-4 mr-2" /> Message
                    </Button>
                    <Button className="flex-1" variant="outline">
                      <Phone className="h-4 w-4 mr-2" /> Call
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold mb-4">Share trip status</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Share your live trip status with friends or family for safety
                  </p>
                  <Button variant="outline" className="w-full">
                    Share trip
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
