"use client";

// app/test-rides/page.tsx
// Test page for creating and viewing rides

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Plus, Trash2, Eye } from "lucide-react";
import Link from "next/link";

interface Ride {
  id: string;
  origin: string;
  destination: string;
  departure_time: string;
  available_seats: number;
  price_per_seat: number;
  status: string;
}

export default function TestRidesPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Create a test ride
  const createTestRide = async () => {
    setIsCreating(true);
    setMessage(null);

    try {
      const response = await fetch("/api/rides/test", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: "✅ Test ride created successfully!",
        });
        // Refresh the list
        await loadRides();
      } else {
        setMessage({
          type: "error",
          text: `❌ Error: ${data.error || "Failed to create ride"}`,
        });
      }
    } catch (error: any) {
      setMessage({ type: "error", text: `❌ Error: ${error.message}` });
    } finally {
      setIsCreating(false);
    }
  };

  // Load all rides
  const loadRides = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/rides/test");
      const data = await response.json();

      if (data.success) {
        setRides(data.rides || []);
        setMessage({
          type: "success",
          text: `✅ Loaded ${data.count} ride(s)`,
        });
      } else {
        setMessage({
          type: "error",
          text: `❌ Error: ${data.error || "Failed to load rides"}`,
        });
      }
    } catch (error: any) {
      setMessage({ type: "error", text: `❌ Error: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete all test rides (useful for cleanup)
  const deleteAllRides = async () => {
    if (
      !confirm(
        "Are you sure you want to delete ALL rides? This cannot be undone!"
      )
    ) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/rides/test", {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: `✅ Deleted ${data.count} ride(s)`,
        });
        setRides([]);
      } else {
        setMessage({
          type: "error",
          text: `❌ Error: ${data.error || "Failed to delete rides"}`,
        });
      }
    } catch (error: any) {
      setMessage({ type: "error", text: `❌ Error: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🧪 Test Rides Manager
        </h1>
        <p className="text-gray-600">
          Create test rides to populate your database for testing
        </p>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create
            </CardTitle>
            <CardDescription>Add a test ride</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={createTestRide}
              disabled={isCreating}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Test Ride"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5" />
              View
            </CardTitle>
            <CardDescription>Load all rides</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={loadRides}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load Rides"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete
            </CardTitle>
            <CardDescription>Clear all test rides</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={deleteAllRides}
              disabled={isLoading}
              variant="destructive"
              className="w-full"
            >
              Delete All Rides
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Rides List */}
      <Card>
        <CardHeader>
          <CardTitle>Test Rides ({rides.length})</CardTitle>
          <CardDescription>
            {rides.length === 0
              ? 'No rides yet. Click "Create Test Ride" to add one.'
              : 'Click "Load Rides" to refresh the list'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rides.length > 0 ? (
            <div className="space-y-3">
              {rides.map((ride) => (
                <div
                  key={ride.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {ride.origin} → {ride.destination}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {new Date(ride.departure_time).toLocaleString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {ride.available_seats} seats • €{ride.price_per_seat}{" "}
                        per seat
                      </div>
                      <div className="text-xs text-gray-400 mt-1 font-mono">
                        ID: {ride.id.slice(0, 8)}...
                      </div>
                    </div>
                    <Link href={`/rides/${ride.id}`}>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-4">No rides to display</p>
              <Button onClick={createTestRide} disabled={isCreating}>
                Create Your First Test Ride
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="mt-6 flex gap-4">
        <Link href="/rides" className="flex-1">
          <Button variant="outline" className="w-full">
            View All Rides (Public)
          </Button>
        </Link>
        <Link href="/api/test-db" className="flex-1">
          <Button variant="outline" className="w-full">
            Test Database Connection
          </Button>
        </Link>
      </div>
    </div>
  );
}
