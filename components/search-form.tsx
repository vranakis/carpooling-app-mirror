"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddressAutocomplete } from "@/components/address-autocomplete";
import { Calendar, Search, Filter } from "lucide-react";
import type { PlaceDetails } from "@/lib/actions/places-autocomplete";

interface SearchFormProps {
  defaultOrigin?: string;
  defaultDestination?: string;
  defaultDate?: string;
  defaultOriginPlaceId?: string;
  defaultDestinationPlaceId?: string;
}

export function SearchForm({
  defaultOrigin = "",
  defaultDestination = "",
  defaultDate = "",
  defaultOriginPlaceId = "",
  defaultDestinationPlaceId = "",
}: SearchFormProps) {
  const [originPlace, setOriginPlace] = useState<PlaceDetails | null>(
    defaultOriginPlaceId
      ? {
          placeId: defaultOriginPlaceId,
          formattedAddress: defaultOrigin,
          address: defaultOrigin,
          coordinates: { lat: 0, lng: 0 },
        }
      : null
  );
  const [destinationPlace, setDestinationPlace] = useState<PlaceDetails | null>(
    defaultDestinationPlaceId
      ? {
          placeId: defaultDestinationPlaceId,
          formattedAddress: defaultDestination,
          address: defaultDestination,
          coordinates: { lat: 0, lng: 0 },
        }
      : null
  );
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Use place formatted addresses if available, otherwise use manual input
    const origin =
      originPlace?.formattedAddress || (formData.get("origin") as string);
    const destination =
      destinationPlace?.formattedAddress ||
      (formData.get("destination") as string);
    const date = formData.get("date") as string;

    // Build search URL
    const searchParams = new URLSearchParams();
    if (origin) searchParams.set("origin", origin);
    if (destination) searchParams.set("destination", destination);
    if (date) searchParams.set("date", date);

    // Add place IDs for enhanced search if available
    if (originPlace?.placeId)
      searchParams.set("originPlaceId", originPlace.placeId);
    if (destinationPlace?.placeId)
      searchParams.set("destinationPlaceId", destinationPlace.placeId);

    console.log("Submitting search:", {
      origin,
      destination,
      date,
      originPlaceId: originPlace?.placeId,
      destinationPlaceId: destinationPlace?.placeId,
    });
    router.push(`/search?${searchParams.toString()}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sticky top-4">
      <h2 className="font-medium flex items-center mb-4">
        <Filter className="h-4 w-4 mr-2" />
        Search Filters
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AddressAutocomplete
          label="From"
          placeholder="Origin city or address"
          name="origin"
          defaultValue={defaultOrigin}
          onPlaceSelected={setOriginPlace}
        />

        <AddressAutocomplete
          label="To"
          placeholder="Destination city or address"
          name="destination"
          defaultValue={defaultDestination}
          onPlaceSelected={setDestinationPlace}
        />

        <div>
          <label htmlFor="date" className="block text-sm font-medium mb-1">
            Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="date"
              name="date"
              type="date"
              className="pl-9"
              defaultValue={defaultDate}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-600"
        >
          <Search className="h-4 w-4 mr-2" />
          Search Rides
        </Button>
      </form>
    </div>
  );
}
