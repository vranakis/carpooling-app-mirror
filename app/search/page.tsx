import { searchRides } from "@/lib/actions/rides"
import { RideCard } from "@/components/ride-card"
import { Button } from "@/components/ui/button"
import { SearchForm } from "@/components/search-form"

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
          <SearchForm
            defaultOrigin={origin}
            defaultDestination={destination}
            defaultDate={date}
          />
        </div>

        <div className="md:col-span-3">
          {rides.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {rides.map((ride) => (
                <RideCard key={ride.id} ride={ride} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
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
