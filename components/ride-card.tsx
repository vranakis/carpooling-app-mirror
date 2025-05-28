import { formatDistanceToNow, format } from "date-fns"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users } from "lucide-react"
import Link from "next/link"

interface RideCardProps {
  ride: any
  showActions?: boolean
}

export function RideCard({ ride, showActions = true }: RideCardProps) {
  const departureDate = new Date(ride.departure_time)
  const formattedDate = format(departureDate, "MMM d, yyyy")
  const formattedTime = format(departureDate, "h:mm a")
  const timeFromNow = formatDistanceToNow(departureDate, { addSuffix: true })

  const driver = ride.driver || {}
  const driverName = `${driver.first_name || ""} ${driver.last_name || ""}`.trim() || "Unknown Driver"
  const driverInitials = driverName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold">
              {ride.origin} to {ride.destination}
            </CardTitle>
            <div className="flex items-center mt-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              {formattedDate} • <Clock className="h-4 w-4 mx-1" /> {formattedTime}
              <Badge variant="outline" className="ml-2">
                {timeFromNow}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">
              {typeof ride.price === "number" ? `$${ride.price.toFixed(2)}` : "Price unavailable"}
            </div>
            <div className="text-sm text-muted-foreground">per seat</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center mb-3">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage
              src={driver.avatar_url || "/placeholder.svg?height=40&width=40&query=avatar"}
              alt={driverName}
            />
            <AvatarFallback>{driverInitials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{driverName}</div>
            <div className="text-xs text-muted-foreground">Driver</div>
          </div>
        </div>

        <div className="flex items-center text-sm">
          <Users className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>{ride.available_seats} seats available</span>
        </div>

        {ride.description && <div className="mt-3 text-sm text-muted-foreground">{ride.description}</div>}
      </CardContent>
      {showActions && (
        <CardFooter className="pt-2">
          <div className="flex w-full gap-2">
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/ride/${ride.id}`}>View Details</Link>
            </Button>
            <Button asChild className="flex-1 bg-emerald-500 hover:bg-emerald-600">
              <Link href={`/book/${ride.id}`}>Book Seat</Link>
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
