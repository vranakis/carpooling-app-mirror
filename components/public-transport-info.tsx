"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bus, Clock, ExternalLink, Info, MapPin, Train } from "lucide-react"
import Link from "next/link"

export default function PublicTransportInfo() {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Info className="h-5 w-5 text-blue-500 mr-2" />
          Public Transport Options
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!expanded ? (
          <div>
            <p className="text-gray-600 mb-4">
              There are public transport options available near your route. Combining carpooling with public transport
              could save time and reduce costs.
            </p>
            <Button variant="outline" onClick={() => setExpanded(true)}>
              Show public transport options
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Tabs defaultValue="metro" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="metro">Metro</TabsTrigger>
                <TabsTrigger value="bus">Bus</TabsTrigger>
                <TabsTrigger value="tram">Tram</TabsTrigger>
              </TabsList>
              <TabsContent value="metro" className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Train className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Line 3 (Blue Line)</h3>
                      <div className="text-sm text-gray-500 space-y-1 mt-1">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>Nearest station: Syntagma (1.2 km from your route)</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Frequency: Every 5-7 minutes during peak hours</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Train className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Line 2 (Red Line)</h3>
                      <div className="text-sm text-gray-500 space-y-1 mt-1">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>Nearest station: Omonia (0.8 km from your route)</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Frequency: Every 6-8 minutes during peak hours</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="bus" className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Bus className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Bus A3 (Glyfada - Syntagma)</h3>
                      <div className="text-sm text-gray-500 space-y-1 mt-1">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>Nearest stop: Glyfada Central (0.3 km from your route)</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Frequency: Every 15 minutes during peak hours</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Bus className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Bus 040 (Piraeus - Syntagma)</h3>
                      <div className="text-sm text-gray-500 space-y-1 mt-1">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>Nearest stop: Faliro (0.5 km from your route)</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Frequency: Every 20 minutes during peak hours</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="tram" className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Train className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Tram T3 (Voula - SEF)</h3>
                      <div className="text-sm text-gray-500 space-y-1 mt-1">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>Nearest stop: Glyfada (0.4 km from your route)</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Frequency: Every 15-20 minutes during peak hours</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Train className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Tram T4 (Syntagma - SEF)</h3>
                      <div className="text-sm text-gray-500 space-y-1 mt-1">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>Nearest stop: Syntagma (0.1 km from your route)</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Frequency: Every 15 minutes during peak hours</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-between items-center pt-2">
              <Button variant="outline" onClick={() => setExpanded(false)}>
                Hide options
              </Button>
              <Button asChild variant="outline" className="flex items-center">
                <Link href="/public-transport">
                  <span className="flex items-center">
                    View multimodal routes <ExternalLink className="h-4 w-4 ml-2" />
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
