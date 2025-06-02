"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Clock, MessageSquare, Star, Users } from "lucide-react"
import Link from "next/link"

import { getUserBookings, getUserRides } from "@/lib/actions/rides"
import { format, isPast } from "date-fns"
import CancelBookingButton from "@/components/cancel-booking-button"
import { PullToRefresh } from "@/components/pull-to-refresh"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

export default function MyRidesPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [rides, setRides] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { profile } = useAuth()

  // Get the tab from URL params, default to "upcoming"
  const defaultTab = searchParams.get("tab") || "upcoming"

  const fetchData = async () => {
    try {
      if (!profile) {
        router.push("/auth/login?redirect=/my-rides")
        return
      }

      console.log("Fetching rides data...")
      const [fetchedBookings, fetchedRides] = await Promise.all([getUserBookings(), getUserRides()])

      console.log("Fetched bookings:", fetchedBookings?.length || 0)
      console.log("Fetched rides:", fetchedRides?.length || 0)

      setBookings(fetchedBookings || [])
      setRides(fetchedRides || [])
      setLoading(false)
    } catch (error) {
      console.error("Error fetching rides data:", error)
      toast.error("Failed to load rides data")
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [profile, router])

  const handleRefresh = async () => {
    try {
      await fetchData()
      toast.success("Rides updated!")
    } catch (error) {
      toast.error("Failed to refresh rides")
      console.error("Error refreshing rides:", error)
    }
  }

  const upcomingBookings = bookings?.filter(
    (booking) => booking.status !== "cancelled" && !isPast(new Date(booking.ride.departure_time)),
  )
  const pastBookings = bookings?.filter(
    (booking) => booking.status === "completed" || isPast(new Date(booking.ride.departure_time)),
  )

  const upcomingRides = rides?.filter((ride) => !isPast(new Date(ride.departure_time)) && ride.status === "active")
  const pastRides = rides?.filter((ride) => isPast(new Date(ride.departure_time)) || ride.status !== "active")

  return (
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">My Rides</h1>

          <PullToRefresh onRefresh={handleRefresh}>
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4 md:mb-6">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="offering">My Offerings</TabsTrigger>
                <TabsTrigger value="past">Past Rides</TabsTrigger>
              </TabsList>

              {/* Upcoming Rides Tab */}
              <TabsContent value="upcoming" className="space-y-4 md:space-y-6">

                {loading ? (
                  // Loading skeletons
                  Array(2)
                    .fill(0)
                    .map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-0">
                          <div className="p-4 border-b flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                            <div className="space-y-2">
                              <div className="h-4 w-24 bg-gray-200 rounded"></div>
                              <div className="h-3 w-16 bg-gray-200 rounded"></div>
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="space-y-3">
                              <div className="h-4 w-full bg-gray-200 rounded"></div>
                              <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                              <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                ) : upcomingBookings && upcomingBookings.length > 0 ? (
                  upcomingBookings.map((booking) => (
                    <Card key={booking.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-0">
                        <div className="p-4 border-b flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-emerald-100 text-emerald-700">
                                {booking.ride.driver_id.first_name?.[0]}
                                {booking.ride.driver_id.last_name?.[0]}
                              </AvatarFallback>
                              <AvatarImage
                                src={booking.ride.driver_id.avatar_url || "/placeholder.svg?height=40&width=40"}
                              />
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {booking.ride.driver_id.first_name} {booking.ride.driver_id.last_name?.[0]}.
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Star className="h-3 w-3 text-yellow-500 mr-1" fill="currentColor" />
                                {booking.ride.driver_id.rating || 0}
                              </div>
                            </div>
                          </div>
                          <Badge
                            className={
                              booking.status === "confirmed"
                                ? "bg-emerald-500"
                                : booking.status === "pending"
                                  ? "bg-yellow-500"
                                  : "bg-gray-500"
                            }
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                              <div className="w-0.5 h-16 bg-gray-200"></div>
                              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between mb-6">
                                <div>
                                  <div className="font-medium">{booking.ride.departure_location}</div>
                                  <div className="text-sm text-gray-500">
                                    {format(new Date(booking.ride.departure_time), "MMM d, h:mm a")}
                                  </div>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {booking.ride.estimated_arrival_time
                                    ? `${Math.round(
                                        (new Date(booking.ride.estimated_arrival_time).getTime() -
                                          new Date(booking.ride.departure_time).getTime()) /
                                          (1000 * 60),
                                      )} min`
                                    : "~45 min"}
                                </div>
                              </div>
                              <div>
                                <div className="font-medium">{booking.ride.destination}</div>
                                <div className="text-sm text-gray-500">
                                  {booking.ride.estimated_arrival_time
                                    ? format(new Date(booking.ride.estimated_arrival_time), "MMM d, h:mm a")
                                    : "Estimated arrival"}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <div className="text-sm">
                              <span className="font-medium">€{booking.ride.contribution_amount}</span>
                              <span className="text-gray-500"> • {booking.seats_booked} seat(s)</span>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/messages/${booking.ride.driver_id.id}?ride=${booking.ride.id}`}>
                                  <MessageSquare className="h-4 w-4 mr-1" /> Message
                                </Link>
                              </Button>
                              <CancelBookingButton bookingId={booking.id} />
                              {booking.status === "confirmed" && (
                                <Button asChild size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                                  <Link href={`/tracking/${booking.ride.id}`}>Track ride</Link>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">You don't have any upcoming bookings.</p>
                    <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                      <Link href="/">Find a ride</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* My Offerings Tab */}
              <TabsContent value="offering" className="space-y-4 md:space-y-6">
                <div className="flex justify-end items-center">
                  <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                    <Link href="/offer-ride">+ Offer a new ride</Link>
                  </Button>
                </div>

                {loading ? (
                  // Loading skeletons
                  Array(2)
                    .fill(0)
                    .map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-0">
                          <div className="p-4 border-b">
                            <div className="h-4 w-32 bg-gray-200 rounded"></div>
                          </div>
                          <div className="p-4">
                            <div className="space-y-3">
                              <div className="h-4 w-full bg-gray-200 rounded"></div>
                              <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                              <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                ) : upcomingRides && upcomingRides.length > 0 ? (
                  upcomingRides.map((ride) => {
                    const confirmedBookings = ride.bookings?.filter((booking: any) => booking.status === "confirmed") || []
                    const pendingBookings = ride.bookings?.filter((booking: any) => booking.status === "pending") || []
                    const totalBookedSeats =
                      confirmedBookings.reduce((total: number, booking: any) => total + booking.seats_booked, 0) +
                      pendingBookings.reduce((total: number, booking: any) => total + booking.seats_booked, 0)

                    return (
                      <Card key={ride.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-0">
                          <div className="p-4 border-b flex items-center justify-between">
                            <div className="font-medium">
                              Your {ride.vehicle?.make} {ride.vehicle?.model}
                            </div>
                            <Badge className={pendingBookings.length > 0 ? "bg-blue-500" : "bg-gray-500"}>
                              {pendingBookings.length > 0
                                ? `${pendingBookings.length} pending request${pendingBookings.length > 1 ? "s" : ""}`
                                : confirmedBookings.length > 0
                                  ? `${confirmedBookings.length} booking${confirmedBookings.length > 1 ? "s" : ""}`
                                  : "No bookings yet"}
                            </Badge>
                          </div>
                          <div className="p-4">
                            <div className="flex items-start gap-4">
                              <div className="flex flex-col items-center">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <div className="w-0.5 h-16 bg-gray-200"></div>
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between mb-6">
                                  <div>
                                    <div className="font-medium">{ride.departure_location}</div>
                                    <div className="text-sm text-gray-500">
                                      {format(new Date(ride.departure_time), "MMM d, h:mm a")}
                                    </div>
                                  </div>
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {ride.estimated_arrival_time
                                      ? `${Math.round(
                                          (new Date(ride.estimated_arrival_time).getTime() -
                                            new Date(ride.departure_time).getTime()) /
                                            (1000 * 60),
                                        )} min`
                                      : "~45 min"}
                                  </div>
                                </div>
                                <div>
                                  <div className="font-medium">{ride.destination}</div>
                                  <div className="text-sm text-gray-500">
                                    {ride.estimated_arrival_time
                                      ? format(new Date(ride.estimated_arrival_time), "MMM d, h:mm a")
                                      : "Estimated arrival"}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex items-center text-sm">
                                <Users className="h-4 w-4 mr-1 text-gray-500" />
                                <span className="text-gray-500">
                                  {totalBookedSeats} of {ride.available_seats + totalBookedSeats} seats booked
                                </span>
                                <span className="mx-2 text-gray-300">•</span>
                                <span className="font-medium">€{ride.contribution_amount}</span>
                                <span className="text-gray-500"> per seat</span>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/ride/${ride.id}`}>View</Link>
                                </Button>
                                <Button asChild size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                                  <Link href={`/manage-booking/${ride.id}`}>Manage</Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">You're not offering any rides yet.</p>
                    <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                      <Link href="/offer-ride">Offer a ride</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Past Rides Tab */}
              <TabsContent value="past" className="space-y-4 md:space-y-6">

                {loading ? (
                  // Loading skeletons
                  Array(2)
                    .fill(0)
                    .map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-0">
                          <div className="p-4 border-b flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                            <div className="space-y-2">
                              <div className="h-4 w-24 bg-gray-200 rounded"></div>
                              <div className="h-3 w-16 bg-gray-200 rounded"></div>
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="space-y-3">
                              <div className="h-4 w-full bg-gray-200 rounded"></div>
                              <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                              <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                ) : pastBookings && pastBookings.length > 0 ? (
                  pastBookings.map((booking) => (
                    <Card key={booking.id} className="hover:shadow-md transition-shadow opacity-75">
                      <CardContent className="p-0">
                        <div className="p-4 border-b flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-emerald-100 text-emerald-700">
                                {booking.ride.driver_id.first_name?.[0]}
                                {booking.ride.driver_id.last_name?.[0]}
                              </AvatarFallback>
                              <AvatarImage
                                src={booking.ride.driver_id.avatar_url || "/placeholder.svg?height=40&width=40"}
                              />
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {booking.ride.driver_id.first_name} {booking.ride.driver_id.last_name?.[0]}.
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Star className="h-3 w-3 text-yellow-500 mr-1" fill="currentColor" />
                                {booking.ride.driver_id.rating || 0}
                              </div>
                            </div>
                          </div>
                          <Badge className="bg-gray-500">
                            {booking.status === "cancelled" ? "Cancelled" : "Completed"}
                          </Badge>
                        </div>
                        <div className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                              <div className="w-0.5 h-16 bg-gray-200"></div>
                              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between mb-6">
                                <div>
                                  <div className="font-medium">{booking.ride.departure_location}</div>
                                  <div className="text-sm text-gray-500">
                                    {format(new Date(booking.ride.departure_time), "MMM d, h:mm a")}
                                  </div>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {booking.ride.estimated_arrival_time
                                    ? `${Math.round(
                                        (new Date(booking.ride.estimated_arrival_time).getTime() -
                                          new Date(booking.ride.departure_time).getTime()) /
                                          (1000 * 60),
                                      )} min`
                                    : "~45 min"}
                                </div>
                              </div>
                              <div>
                                <div className="font-medium">{booking.ride.destination}</div>
                                <div className="text-sm text-gray-500">
                                  {booking.ride.estimated_arrival_time
                                    ? format(new Date(booking.ride.estimated_arrival_time), "MMM d, h:mm a")
                                    : "Estimated arrival"}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <div className="text-sm">
                              <span className="font-medium">€{booking.ride.contribution_amount}</span>
                              <span className="text-gray-500"> • {booking.seats_booked} seat(s)</span>
                            </div>
                            <div className="flex gap-2">
                              {booking.status !== "cancelled" && (
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/review/${booking.ride.driver_id.id}?ride=${booking.ride.id}`}>
                                    Leave review
                                  </Link>
                                </Button>
                              )}
                              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" asChild>
                                <Link href={`/ride/${booking.ride.id}`}>View details</Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">You don't have any past rides.</p>
                  </div>
                )}

                {pastRides && pastRides.length > 0 && (
                  <>
                    <div className="mt-8 mb-4">
                      <h3 className="text-lg font-medium text-gray-700">Rides you've offered</h3>
                    </div>
                    {pastRides.map((ride) => {
                      const confirmedBookings = ride.bookings?.filter((booking: any) => booking.status === "confirmed") || []
                      const totalBookedSeats = confirmedBookings.reduce(
                        (total: number, booking: any) => total + booking.seats_booked,
                        0,
                      )

                      return (
                        <Card key={ride.id} className="hover:shadow-md transition-shadow opacity-75">
                          <CardContent className="p-0">
                            <div className="p-4 border-b flex items-center justify-between">
                              <div className="font-medium">
                                Your {ride.vehicle?.make} {ride.vehicle?.model}
                              </div>
                              <Badge className="bg-gray-500">
                                {ride.status === "cancelled" ? "Cancelled" : "Completed"}
                              </Badge>
                            </div>
                            <div className="p-4">
                              <div className="flex items-start gap-4">
                                <div className="flex flex-col items-center">
                                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                  <div className="w-0.5 h-16 bg-gray-200"></div>
                                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between mb-6">
                                    <div>
                                      <div className="font-medium">{ride.departure_location}</div>
                                      <div className="text-sm text-gray-500">
                                        {format(new Date(ride.departure_time), "MMM d, h:mm a")}
                                      </div>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                      <Clock className="h-4 w-4 mr-1" />
                                      {ride.estimated_arrival_time
                                        ? `${Math.round(
                                            (new Date(ride.estimated_arrival_time).getTime() -
                                              new Date(ride.departure_time).getTime()) /
                                              (1000 * 60),
                                          )} min`
                                        : "~45 min"}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="font-medium">{ride.destination}</div>
                                    <div className="text-sm text-gray-500">
                                      {ride.estimated_arrival_time
                                        ? format(new Date(ride.estimated_arrival_time), "MMM d, h:mm a")
                                        : "Estimated arrival"}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center text-sm">
                                  <Users className="h-4 w-4 mr-1 text-gray-500" />
                                  <span className="text-gray-500">
                                    {totalBookedSeats} of {ride.available_seats + totalBookedSeats} seats booked
                                  </span>
                                  <span className="mx-2 text-gray-300">•</span>
                                  <span className="font-medium">€{ride.contribution_amount}</span>
                                  <span className="text-gray-500"> per seat</span>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" asChild>
                                    <Link href={`/ride/${ride.id}`}>View details</Link>
                                  </Button>
                                  <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" asChild>
                                    <Link href="/offer-ride">Offer again</Link>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </PullToRefresh>
        </div>
    </div>
  )
}
