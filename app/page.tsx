import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Users, Leaf, MapPin, Clock, DollarSign } from "lucide-react";
import Link from "next/link";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If no user, redirect to login
  if (!user) {
    redirect("/auth/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Get some sample data for the dashboard
  const { data: rides } = await supabase
    .from("rides")
    .select("*")
    .limit(3)
    .order("departure_time", { ascending: true });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {profile?.first_name || user.email}!
        </h1>
        <p className="text-gray-200">
          Ready to share a ride and reduce your carbon footprint?
        </p>
      </div>

      {/* Debug Info - Remove in production */}
      <div className="mb-8 p-4 bg-grey-300 rounded-lg">
        <h3 className="font-semibold text-blue-200 mb-2">
          Session Debug Info:
        </h3>
        <p className="text-sm text-blue-150">User ID: {user.id}</p>
        <p className="text-sm text-blue-150">Email: {user.email}</p>
        <p className="text-sm text-blue-150">
          Profile: {profile?.first_name} {profile?.last_name}
        </p>
        <p className="text-sm text-blue-150">Session Active: ✅</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 ">
            <CardTitle className="text-sm font-medium">Find a Ride</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link href="/search" className=" dark:bg-gray-800">
              <Button className="w-full dark:bg-emerald-600 dark:text-white">
                Search Rides
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offer a Ride</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link href="/offer-ride">
              <Button className="w-full dark:bg-gray-800" variant="outline">
                Create Ride
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Rides</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link href="/my-rides">
              <Button className="w-full dark:bg-gray-800" variant="outline">
                View Rides
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impact</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link href="/impact">
              <Button className="w-full dark:bg-gray-800" variant="outline">
                View Impact
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Rides */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Rides</CardTitle>
          <CardDescription>Recent rides available in your area</CardDescription>
        </CardHeader>
        <CardContent>
          {rides && rides.length > 0 ? (
            <div className="space-y-4">
              {rides.map((ride) => (
                <div
                  key={ride.id}
                  className="dark:bg-grey-800 flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {ride.pickup_location} → {ride.destination}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {new Date(ride.departure_time).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">${ride.price}</span>
                    </div>
                  </div>
                  <Link href={`/ride/${ride.id}`}>
                    <Button size="sm">View Details</Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No upcoming rides found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
