import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Users, AlertTriangle, Phone, Share2, Info } from "lucide-react"
import Link from "next/link"
import AppHeader from "@/components/app-header"

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Safety Center</h1>
          <p className="text-gray-500 mb-8">Learn about our safety features and how to stay safe while carpooling</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-blue-50 border-blue-100">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Shield className="h-12 w-12 text-blue-600 mb-4" />
                  <h2 className="text-lg font-bold text-blue-700 mb-2">Verified Users</h2>
                  <p className="text-blue-600">
                    All drivers and passengers can verify their identity for added security
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-emerald-50 border-emerald-100">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Users className="h-12 w-12 text-emerald-600 mb-4" />
                  <h2 className="text-lg font-bold text-emerald-700 mb-2">Community Ratings</h2>
                  <p className="text-emerald-600">Review system helps maintain a trusted community of carpoolers</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-amber-50 border-amber-100">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Share2 className="h-12 w-12 text-amber-600 mb-4" />
                  <h2 className="text-lg font-bold text-amber-700 mb-2">Trip Sharing</h2>
                  <p className="text-amber-600">
                    Share your trip details with friends or family for added peace of mind
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Emergency Assistance</CardTitle>
              <CardDescription>Access emergency help when you need it</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-red-800">In case of emergency</h3>
                  <p className="text-red-700 text-sm mt-1">
                    If you're in immediate danger, always call emergency services first at 112 (European emergency
                    number) or 100 (Greek police).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-emerald-500 mt-0.5 mr-3" />
                    <div>
                      <h3 className="font-medium">24/7 Support Hotline</h3>
                      <p className="text-gray-500 text-sm mt-1">
                        Our support team is available 24/7 to assist with any issues during your ride.
                      </p>
                      <Button className="mt-4 bg-emerald-500 hover:bg-emerald-600">Contact Support</Button>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-start">
                    <Share2 className="h-5 w-5 text-emerald-500 mt-0.5 mr-3" />
                    <div>
                      <h3 className="font-medium">Share Your Trip</h3>
                      <p className="text-gray-500 text-sm mt-1">
                        Share your trip details with trusted contacts so they can follow your journey in real-time.
                      </p>
                      <Button className="mt-4 bg-emerald-500 hover:bg-emerald-600">Share Trip Details</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Safety Tips</CardTitle>
              <CardDescription>Follow these guidelines for a safe carpooling experience</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-emerald-100 text-emerald-700 rounded-full h-6 w-6 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium">Verify profiles before riding</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Check user profiles, ratings, and reviews before accepting or requesting a ride. Look for verified
                      users with complete profiles.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-emerald-100 text-emerald-700 rounded-full h-6 w-6 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium">Meet in public places</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Always arrange pickup and drop-off points in well-lit, public areas like metro stations, shopping
                      centers, or busy streets.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-emerald-100 text-emerald-700 rounded-full h-6 w-6 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Share your trip details</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Let a friend or family member know about your carpooling plans, including who you're riding with
                      and your expected arrival time.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-emerald-100 text-emerald-700 rounded-full h-6 w-6 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="font-medium">Trust your instincts</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      If something doesn't feel right about a ride or driver, don't hesitate to cancel. Your safety is
                      the top priority.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-emerald-100 text-emerald-700 rounded-full h-6 w-6 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0">
                    5
                  </div>
                  <div>
                    <h3 className="font-medium">Stay connected</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Keep your phone charged and within reach during your ride. Use the in-app messaging to communicate
                      with your carpool partner.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Community Guidelines</CardTitle>
              <CardDescription>Our community values and expectations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Respect for all</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Treat all community members with respect regardless of background, gender, age, or beliefs.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Reliability</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Be on time and honor your commitments. If plans change, notify others as soon as possible.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Honest reviews</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Leave honest, constructive feedback after rides to help build a trusted community.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">No commercial activity</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      This is a community carpooling platform. Do not use it for commercial transportation services.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                  <Link href="/terms">Read Full Community Guidelines</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
