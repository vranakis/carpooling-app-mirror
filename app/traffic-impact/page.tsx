import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, TrendingDown, Users } from "lucide-react"
import Link from "next/link"
import AppHeader from "@/components/app-header"

export default function TrafficImpactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Our Impact on Athens Traffic</h1>
          <p className="text-gray-500 mb-8">
            Together, we're making Athens more livable by reducing traffic congestion
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-emerald-50">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Car className="h-12 w-12 text-emerald-600 mb-4" />
                  <h2 className="text-4xl font-bold text-emerald-700">1,240</h2>
                  <p className="text-emerald-600 font-medium">Cars off the road daily</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <TrendingDown className="h-12 w-12 text-blue-600 mb-4" />
                  <h2 className="text-4xl font-bold text-blue-700">18%</h2>
                  <p className="text-blue-600 font-medium">Reduced commute time</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Users className="h-12 w-12 text-purple-600 mb-4" />
                  <h2 className="text-4xl font-bold text-purple-700">5,800</h2>
                  <p className="text-purple-600 font-medium">Active community members</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Traffic Reduction by Area</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">Syntagma - Glyfada</span>
                    <span>24% reduction</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: "24%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">Kifissia - Athens Center</span>
                    <span>19% reduction</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: "19%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">Piraeus - Marousi</span>
                    <span>15% reduction</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: "15%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">Chalandri - Peristeri</span>
                    <span>12% reduction</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: "12%" }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Join the Movement</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">How You Can Help</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <span className="bg-emerald-100 text-emerald-700 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                        1
                      </span>
                      <span>Share your daily commute with neighbors and colleagues</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-emerald-100 text-emerald-700 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                        2
                      </span>
                      <span>Invite friends to join the community</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-emerald-100 text-emerald-700 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                        3
                      </span>
                      <span>Participate in our monthly traffic-free challenges</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-emerald-100 text-emerald-700 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                        4
                      </span>
                      <span>Spread the word on social media with #AthensBreathe</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Community Recognition</h3>
                    <p className="text-gray-600 mb-4">
                      Our top contributors receive special badges and community recognition for their impact on reducing
                      Athens traffic.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                      <Link href="/offer-ride">Share Your Commute</Link>
                    </Button>
                    <Button variant="outline">Learn More</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
