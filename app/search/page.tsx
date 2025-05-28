import { searchRides } from "@/lib/actions/rides"
import { RideCard } from "@/components/ride-card"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const origin = typeof searchParams.origin === "string" ? searchParams.origin : ""
  const destination = typeof searchParams.destination === "string" ? searchParams.destination : ""
  const date = typeof searchParams.date === "string" ? searchParams.date : ""

  const formData = new FormData()
  if (origin) formData.append("origin", origin)
  if (destination) formData.append("destination", destination)
  if (date) formData.append("date", date)

  const rides = await searchRides(formData)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Search Results</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
            <h2 className="font-medium flex items-center mb-4">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </h2>

            <form action="/search" className="space-y-4">
              <div>
                <label htmlFor="origin" className="block text-sm font-medium mb-1">
                  From
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="origin" name="origin" placeholder="Origin city" className="pl-9" defaultValue={origin} />
                </div>
              </div>

              <div>
                <label htmlFor="destination" className="block text-sm font-medium mb-1">
                  To
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="destination"
                    name="destination"
                    placeholder="Destination city"
                    className="pl-9"
                    defaultValue={destination}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium mb-1">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="date" name="date" type="date" className="pl-9" defaultValue={date} />
                </div>
              </div>

              <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </div>
        </div>

        <div className="md:col-span-3">
          {rides.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {rides.map((ride) => (
                <RideCard key={ride.id} ride={ride} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium">No rides found</h3>
              <p className="text-muted-foreground mt-1">Try adjusting your search criteria</p>
              <Button asChild className="mt-4 bg-emerald-500 hover:bg-emerald-600">
                <a href="/offer-ride">Offer a Ride</a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
