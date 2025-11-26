import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import OfferRideForm from "./offer-ride-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function OfferRidePage() {
  // Check authentication in the server component
  const { userId } = await auth();

  // If not authenticated, redirect to sign-in
  if (!userId) {
    redirect("/sign-in?redirect_url=/offer-ride");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Offer a Ride</h1>
        <p className="text-gray-600">
          Share your journey and help others travel sustainably
        </p>
      </div>

      {/* Pass userId to the client component */}
      <OfferRideForm userId={userId} />

      {/* Quick Links - Use Link instead of onClick! */}
      <div className="mt-6 flex gap-4">
        <Link href="/available-rides" className="flex-1">
          <Button variant="outline" className="w-full">
            View All Rides
          </Button>
        </Link>
        <Link href="/my-rides" className="flex-1">
          <Button variant="outline" className="w-full">
            My Rides
          </Button>
        </Link>
      </div>
    </div>
  );
}
