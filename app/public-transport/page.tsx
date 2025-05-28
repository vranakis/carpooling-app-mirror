import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bus, Calendar, Car, Clock, MapPin, Search, Train } from "lucide-react"
import AppHeader from "@/components/app-header"

export default function PublicTransportPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Multimodal Journey Planner</h1>
          <p className="text-gray-500 mb-8">
            Find the best combination of carpooling and public transport for your journey
          </p>

          <Card className="mb-8">
            <CardContent className="p-6">
              <Tabs defaultValue="multimodal" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="multimodal">Combined</TabsTrigger>
                  <TabsTrigger value="carpool">Carpool Only</TabsTrigger>
                  <TabsTrigger value="public">Public Transport</TabsTrigger>
                </TabsList>
                <TabsContent value="multimodal">
                  <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input className="pl-10" placeholder="Starting point..." />
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input className="pl-10" placeholder="Destination..." />
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input className="pl-10" type="datetime-local" />
                    </div>
                    <Button className="md:col-span-3 bg-emerald-500 hover:bg-emerald-600">
                      <Search className="mr-2 h-4 w-4" /> Find routes
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="carpool">
                  <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input className="pl-10" placeholder="Starting point..." />
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input className="pl-10" placeholder="Destination..." />
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input className="pl-10" type="datetime-local" />
                    </div>
                    <Button className="md:col-span-3 bg-emerald-500 hover:bg-emerald-600">
                      <Car className="mr-2 h-4 w-4" /> Find carpools
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="public">
                  <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input className="pl-10" placeholder="Starting point..." />
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input className="pl-10" placeholder="Destination..." />
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input className="pl-10" type="datetime-local" />
                    </div>
                    <Button className="md:col-span-3 bg-emerald-500 hover:bg-emerald-600">
                      <Bus className="mr-2 h-4 w-4" /> Find public transport
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Sample routes</h2>

            {/* Route Card 1 - Multimodal */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      <Car className="h-5 w-5 text-emerald-500" />
                      <span className="mx-1">+</span>
                      <Train className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="font-medium">Combined route</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">45 min</div>
                    <div className="text-sm text-gray-500">€7 total</div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <div className="w-0.5 h-12 bg-emerald-200"></div>
                      <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      </div>
                      <div className="w-0.5 h-12 bg-blue-200"></div>
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    </div>
                    <div className="flex-1">
                      <div className="mb-4">
                        <div className="font-medium">Glyfada</div>
                        <div className="text-sm text-gray-500">Start at 8:00 AM</div>
                      </div>
                      <div className="mb-4 border-l-2 border-blue-100 pl-4">
                        <div className="flex items-center">
                          <Car className="h-4 w-4 text-emerald-500 mr-2" />
                          <span className="font-medium">Carpool to Syntagma Metro</span>
                        </div>
                        <div className="text-sm text-gray-500">25 min • €5</div>
                      </div>
                      <div className="mb-4">
                        <div className="font-medium">Syntagma Metro Station</div>
                        <div className="text-sm text-gray-500">Transfer at 8:25 AM</div>
                      </div>
                      <div className="mb-4 border-l-2 border-blue-100 pl-4">
                        <div className="flex items-center">
                          <Train className="h-4 w-4 text-blue-500 mr-2" />
                          <span className="font-medium">Metro Line 3 to Keramikos</span>
                        </div>
                        <div className="text-sm text-gray-500">15 min • €2</div>
                      </div>
                      <div>
                        <div className="font-medium">Keramikos</div>
                        <div className="text-sm text-gray-500">Arrive at 8:45 AM</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      45 min total
                    </div>
                    <Button className="bg-emerald-500 hover:bg-emerald-600">View details</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Route Card 2 - Carpool Only */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-emerald-500" />
                    <div className="font-medium">Carpool only</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">55 min</div>
                    <div className="text-sm text-gray-500">€8 total</div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <div className="w-0.5 h-16 bg-emerald-200"></div>
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-6">
                        <div>
                          <div className="font-medium">Glyfada</div>
                          <div className="text-sm text-gray-500">Start at 8:00 AM</div>
                        </div>
                      </div>
                      <div className="mb-4 border-l-2 border-emerald-100 pl-4">
                        <div className="flex items-center">
                          <Car className="h-4 w-4 text-emerald-500 mr-2" />
                          <span className="font-medium">Direct carpool to Keramikos</span>
                        </div>
                        <div className="text-sm text-gray-500">55 min • €8</div>
                      </div>
                      <div>
                        <div className="font-medium">Keramikos</div>
                        <div className="text-sm text-gray-500">Arrive at 8:55 AM</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      55 min total
                    </div>
                    <Button className="bg-emerald-500 hover:bg-emerald-600">View details</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Route Card 3 - Public Transport Only */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bus className="h-5 w-5 text-blue-500" />
                    <div className="font-medium">Public transport only</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">75 min</div>
                    <div className="text-sm text-gray-500">€4 total</div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <div className="w-0.5 h-12 bg-blue-200"></div>
                      <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      </div>
                      <div className="w-0.5 h-12 bg-blue-200"></div>
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    </div>
                    <div className="flex-1">
                      <div className="mb-4">
                        <div className="font-medium">Glyfada</div>
                        <div className="text-sm text-gray-500">Start at 8:00 AM</div>
                      </div>
                      <div className="mb-4 border-l-2 border-blue-100 pl-4">
                        <div className="flex items-center">
                          <Bus className="h-4 w-4 text-blue-500 mr-2" />
                          <span className="font-medium">Bus A3 to Syntagma</span>
                        </div>
                        <div className="text-sm text-gray-500">45 min • €2</div>
                      </div>
                      <div className="mb-4">
                        <div className="font-medium">Syntagma</div>
                        <div className="text-sm text-gray-500">Transfer at 8:45 AM</div>
                      </div>
                      <div className="mb-4 border-l-2 border-blue-100 pl-4">
                        <div className="flex items-center">
                          <Train className="h-4 w-4 text-blue-500 mr-2" />
                          <span className="font-medium">Metro Line 3 to Keramikos</span>
                        </div>
                        <div className="text-sm text-gray-500">15 min • €2</div>
                      </div>
                      <div>
                        <div className="font-medium">Keramikos</div>
                        <div className="text-sm text-gray-500">Arrive at 9:15 AM</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      75 min total
                    </div>
                    <Button className="bg-emerald-500 hover:bg-emerald-600">View details</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
