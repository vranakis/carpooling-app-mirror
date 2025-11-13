"use client";

import { useState, useEffect } from "react";
import { RideCard } from "@/components/ride-card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Ride {
  id: string;
  origin: string;
  destination: string;
  departure_time: string;
  available_seats: number;
  price_per_seat: number;
  status: string;
}

export default function AvailableRidesPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [filteredRides, setFilteredRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [originFilter, setOriginFilter] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Fetch rides from API on mount
  useEffect(() => {
    fetchRides();
  }, []);

  // Apply filters whenever rides or filter values change
  useEffect(() => {
    applyFilters();
  }, [rides, originFilter, destinationFilter, dateFilter]);

  const fetchRides = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/rides");
      const data = await response.json();

      if (data.success) {
        setRides(data.rides || []);
        console.log(`✅ Loaded ${data.count} rides from API`);
      } else {
        setError(data.error || "Failed to load rides");
      }
    } catch (err: any) {
      console.error("Error fetching rides:", err);
      setError(err.message || "Failed to fetch rides");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...rides];

    // Filter by origin (case-insensitive)
    if (originFilter.trim()) {
      filtered = filtered.filter((ride) =>
        ride.origin.toLowerCase().includes(originFilter.toLowerCase())
      );
    }

    // Filter by destination (case-insensitive)
    if (destinationFilter.trim()) {
      filtered = filtered.filter((ride) =>
        ride.destination.toLowerCase().includes(destinationFilter.toLowerCase())
      );
    }

    // Filter by date
    if (dateFilter) {
      const searchDate = new Date(dateFilter);
      searchDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);

      filtered = filtered.filter((ride) => {
        const rideDate = new Date(ride.departure_time);
        return rideDate >= searchDate && rideDate < nextDay;
      });
    }

    setFilteredRides(filtered);
  };

  const handleSearch = () => {
    applyFilters();
  };

  const clearFilters = () => {
    setOriginFilter("");
    setDestinationFilter("");
    setDateFilter("");
  };

  const displayRides =
    filteredRides.length > 0 || originFilter || destinationFilter || dateFilter
      ? filteredRides
      : rides;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Available Rides</h1>

      {/* Search Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="origin">From</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="origin"
                placeholder="Origin city"
                className="pl-9"
                value={originFilter}
                onChange={(e) => setOriginFilter(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="destination">To</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="destination"
                placeholder="Destination city"
                className="pl-9"
                value={destinationFilter}
                onChange={(e) => setDestinationFilter(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="date"
                type="date"
                className="pl-9"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-end gap-2">
            <Button
              onClick={handleSearch}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            {(originFilter || destinationFilter || dateFilter) && (
              <Button onClick={clearFilters} variant="outline">
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <span className="ml-2 text-gray-600">Loading rides...</span>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">Error loading rides: {error}</p>
          <Button onClick={fetchRides} variant="outline">
            Try Again
          </Button>
        </div>
      )}

      {/* Rides Display */}
      {!isLoading && !error && (
        <>
          {displayRides.length > 0 ? (
            <>
              <div className="mb-4 text-sm text-gray-600">
                Showing {displayRides.length} of {rides.length} rides
                {(originFilter || destinationFilter || dateFilter) &&
                  " (filtered)"}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayRides.map((ride) => (
                  <RideCard key={ride.id} ride={ride} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="text-lg font-medium">
                {originFilter || destinationFilter || dateFilter
                  ? "No rides match your filters"
                  : "No rides available"}
              </h3>
              <p className="text-muted-foreground mt-1">
                {originFilter || destinationFilter || dateFilter
                  ? "Try adjusting your search criteria"
                  : "Check back later or create a ride"}
              </p>
              {(originFilter || destinationFilter || dateFilter) && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
