import { getRideById } from "@/lib/actions/rides"
import { getCurrentUser } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Users, MessageCircle, ChevronLeft } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function RideDetailPage({ params }: { params: { id: string } }) {
  const [ride, currentUser] = await Promise.all([getRideById(params.id), getCurrentUser()])

  if (!ride) {
    notFound()
  }

  const departureDate = new Date(ride.departure_time)
  const arrivalDate = new Date(ride.estimated_arrival_time)
  const formattedDate = format(departureDate, "EEEE, MMMM d, yyyy")
  const formattedDepartureTime = format(departureDate, "h:mm a")
  const formattedArrivalTime = format(arrivalDate, "h:mm a")
  const timeFromNow = formatDistanceToNow(departureDate, { addSuffix: true })

  const driver = ride.driver || {}
  const driverName = `${driver.first_name || ""} ${driver.last_name || ""}`.trim() || "Unknown Driver"
  const driverInitials = driverName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const isDriver = currentUser?.id === driver.id
  const hasBooked = ride.bookings?.some(
    (booking: any) => booking.passenger_id === currentUser?.id && booking.status === "confirmed",
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/search" className="flex items-center text-emerald-600 mb-6">
        <ChevronLeft className="h-4 w-4 mr-1" /> Back to search results
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold">
                    {ride.origin} to {ride.destination}
                  </CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formattedDate}
                    <Badge variant="outline" className="ml-2">
                      {timeFromNow}
                    </Badge>
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">${ride.price.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">per seat</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="bg-emerald-100 text-emerald-700 p-2 rounded-full mr-3">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Departure</div>
                    <div className="font-medium">{ride.origin}</div>
                    <div className="text-sm">{formattedDepartureTime}</div>
                  </div>
                </div>

                <div className="hidden md:block border-t md:border-t-0 md:border-l h-12 border-gray-200"></div>

                <div className="flex items-center">
                  <div className="bg-emerald-100 text-emerald-700 p-2 rounded-full mr-3">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Arrival</div>
                    <div className="font-medium">{ride.destination}</div>
                    <div className="text-sm">{formattedArrivalTime}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Available Seats</h3>
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>
                    {ride.available_seats} {ride.available_seats === 1 ? "seat" : "seats"} available
                  </span>
                </div>
              </div>

              {ride.description && (
                <div>
                  <h3 className="font-medium mb-2">Trip Details</h3>
                  <p className="text-muted-foreground">{ride.description}</p>
                </div>
              )}

              {!isDriver && !hasBooked && (
                <Button asChild className="w-full bg-emerald-500 hover:bg-emerald-600">
                  <Link href={`/book/${ride.id}`}>Book this ride</Link>
                </Button>
              )}

              {!isDriver && hasBooked && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild variant="outline" className="flex-1">
                    <Link href="/my-bookings">View my booking</Link>
                  </Button>
                  <Button asChild className="flex-1 bg-emerald-500 hover:bg-emerald-600">
                    <Link href={`/messages/${driver.id}?ride=${ride.id}`}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message driver
                    </Link>
                  </Button>
                </div>
              )}

              {isDriver && (
                <Button asChild variant="outline" className="w-full">
                  <Link href="/my-rides">Manage this ride</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>About the driver</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Avatar className="h-16 w-16 mr-4">
                  <AvatarImage
                    src={driver.avatar_url || "/placeholder.svg?height=64&width=64&query=avatar"}
                    alt={driverName}
                  />
                  <AvatarFallback>{driverInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-xl font-medium">{driverName}</div>
                  {!isDriver && (
                    <Button asChild variant="ghost" size="sm" className="px-0 text-emerald-600 hover:text-emerald-700">
                      <Link href={`/messages/${driver.id}?ride=${ride.id}`}>
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Send message
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
