import { getRides } from "@/lib/actions/rides"
import { RideCard } from "@/components/ride-card"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default async function AvailableRidesPage() {
  const { rides, error } = await getRides({ limit: 20 })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Available Rides</h1>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="origin">From</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="origin" placeholder="Origin city" className="pl-9" />
            </div>
          </div>

          <div>
            <Label htmlFor="destination">To</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="destination" placeholder="Destination city" className="pl-9" />
            </div>
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="date" type="date" className="pl-9" />
            </div>
          </div>

          <div className="flex items-end">
            <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
              <Search className="h-4 w-4 mr-2" />
              Search Rides
            </Button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="text-center py-8">
          <p className="text-red-500">Error loading rides: {error}</p>
          <Button variant="outline" className="mt-4">
            Try Again
          </Button>
        </div>
      ) : rides && rides.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rides.map((ride) => (
            <RideCard key={ride.id} ride={ride} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No rides available</h3>
          <p className="text-muted-foreground mt-1">Try adjusting your search or check back later</p>
        </div>
      )}
    </div>
  )
}
