// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Clock, Plus, Users } from "lucide-react"
// import Link from "next/link"
// import AppHeader from "@/components/app-header"

// export default function CommuteRoutesPage() {
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <AppHeader />

//       <main className="container mx-auto px-4 py-8">
//         <div className="max-w-4xl mx-auto">
//           <div className="flex justify-between items-center mb-6">
//             <h1 className="text-2xl font-bold">My Commute Routes</h1>
//             <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
//               <Link href="/offer-ride">
//                 <Plus className="h-4 w-4 mr-2" /> Add new route
//               </Link>
//             </Button>
//           </div>

//           <Card className="mb-8">
//             <CardHeader>
//               <CardTitle>Regular commutes you've shared</CardTitle>
//             </CardHeader>
//             <CardContent className="p-0">
//               <div className="divide-y">
//                 <div className="p-4">
//                   <div className="flex justify-between items-start mb-4">
//                     <div>
//                       <h3 className="font-medium text-lg">Work Commute</h3>
//                       <div className="text-sm text-gray-500">Daily (Mon-Fri)</div>
//                     </div>
//                     <Button variant="outline" size="sm">
//                       Edit
//                     </Button>
//                   </div>

//                   <div className="flex items-start gap-4">
//                     <div className="flex flex-col items-center">
//                       <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
//                       <div className="w-0.5 h-16 bg-gray-200"></div>
//                       <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
//                     </div>
//                     <div className="flex-1">
//                       <div className="flex justify-between mb-6">
//                         <div>
//                           <div className="font-medium">Glyfada</div>
//                           <div className="text-sm text-gray-500">8:00 AM</div>
//                         </div>
//                         <div className="flex items-center text-sm text-gray-500">
//                           <Clock className="h-4 w-4 mr-1" />
//                           45m
//                         </div>
//                       </div>
//                       <div>
//                         <div className="font-medium">Syntagma Square</div>
//                         <div className="text-sm text-gray-500">8:45 AM</div>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="mt-4 flex items-center justify-between">
//                     <div className="flex items-center text-sm text-gray-500">
//                       <Users className="h-4 w-4 mr-1" />3 seats available
//                     </div>
//                     <div className="text-sm">
//                       <span className="font-medium">€5</span>
//                       <span className="text-gray-500"> suggested contribution</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="p-4">
//                   <div className="flex justify-between items-start mb-4">
//                     <div>
//                       <h3 className="font-medium text-lg">Weekend Trip</h3>
//                       <div className="text-sm text-gray-500">Weekly (Sat)</div>
//                     </div>
//                     <Button variant="outline" size="sm">
//                       Edit
//                     </Button>
//                   </div>

//                   <div className="flex items-start gap-4">
//                     <div className="flex flex-col items-center">
//                       <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
//                       <div className="w-0.5 h-16 bg-gray-200"></div>
//                       <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
//                     </div>
//                     <div className="flex-1">
//                       <div className="flex justify-between mb-6">
//                         <div>
//                           <div className="font-medium">Athens</div>
//                           <div className="text-sm text-gray-500">10:00 AM</div>
//                         </div>
//                         <div className="flex items-center text-sm text-gray-500">
//                           <Clock className="h-4 w-4 mr-1" />
//                           1h 30m
//                         </div>
//                       </div>
//                       <div>
//                         <div className="font-medium">Sounio</div>
//                         <div className="text-sm text-gray-500">11:30 AM</div>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="mt-4 flex items-center justify-between">
//                     <div className="flex items-center text-sm text-gray-500">
//                       <Users className="h-4 w-4 mr-1" />2 seats available
//                     </div>
//                     <div className="text-sm">
//                       <span className="font-medium">€8</span>
//                       <span className="text-gray-500"> suggested contribution</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Commute Statistics</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div className="bg-emerald-50 p-4 rounded-lg">
//                   <div className="text-emerald-600 font-medium">CO₂ Saved</div>
//                   <div className="text-2xl font-bold">124 kg</div>
//                   <div className="text-sm text-gray-500">By sharing your commute</div>
//                 </div>

//                 <div className="bg-blue-50 p-4 rounded-lg">
//                   <div className="text-blue-600 font-medium">Rides Shared</div>
//                   <div className="text-2xl font-bold">32</div>
//                   <div className="text-sm text-gray-500">Total shared commutes</div>
//                 </div>

//                 <div className="bg-purple-50 p-4 rounded-lg">
//                   <div className="text-purple-600 font-medium">People Helped</div>
//                   <div className="text-2xl font-bold">18</div>
//                   <div className="text-sm text-gray-500">Commuters you've helped</div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </main>
//     </div>
//   )
// }
