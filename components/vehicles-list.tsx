// import { getUserVehicles } from "@/lib/actions/vehicles"
// import { Card, CardContent } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Car, Edit, Trash2, Fuel, Users } from "lucide-react"
// import Link from "next/link"

// export default async function VehiclesList() {
//   try {
//     const vehicles = await getUserVehicles()

//     if (vehicles.length === 0) {
//       return (
//         <Card>
//           <CardContent className="p-6 text-center">
//             <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//             <p className="text-gray-500 mb-4 text-sm md:text-base">You haven't added any vehicles yet.</p>
//             <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
//               <Link href="/profile/vehicles/add">Add your first vehicle</Link>
//             </Button>
//           </CardContent>
//         </Card>
//       )
//     }

//     return (
//       <div className="grid gap-4">
//         {vehicles.map((vehicle) => (
//           <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
//             <CardContent className="p-4 md:p-6">
//               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//                 <div className="flex items-start gap-4">
//                   <div className="bg-emerald-100 p-3 rounded-lg">
//                     <Car className="h-6 w-6 text-emerald-600" />
//                   </div>
//                   <div className="flex-1">
//                     <h3 className="font-semibold text-lg">
//                       {vehicle.make} {vehicle.model}
//                     </h3>
//                     <p className="text-gray-600 mb-2">
//                       {vehicle.year} • {vehicle.color} • {vehicle.license_plate}
//                     </p>
//                     <div className="flex flex-wrap gap-2">
//                       <Badge variant="outline" className="bg-gray-50">
//                         <Users className="h-3 w-3 mr-1" />
//                         {vehicle.seats} seats
//                       </Badge>
//                       <Badge variant="outline" className="bg-gray-50">
//                         <Fuel className="h-3 w-3 mr-1" />
//                         {vehicle.fuel_type}
//                       </Badge>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="flex gap-2">
//                   <Button variant="outline" size="sm" asChild>
//                     <Link href={`/profile/vehicles/edit/${vehicle.id}`}>
//                       <Edit className="h-4 w-4 mr-1" />
//                       Edit
//                     </Link>
//                   </Button>
//                   <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
//                     <Trash2 className="h-4 w-4 mr-1" />
//                     Remove
//                   </Button>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     )
//   } catch (error) {
//     console.error("Error loading vehicles:", error)
//     return (
//       <Card>
//         <CardContent className="p-6 text-center">
//           <Car className="h-12 w-12 text-red-400 mx-auto mb-4" />
//           <p className="text-red-500 mb-4 text-sm md:text-base">Unable to load vehicles. Please try again later.</p>
//           <Button asChild variant="outline">
//             <Link href="/profile/vehicles/add">Add a vehicle</Link>
//           </Button>
//         </CardContent>
//       </Card>
//     )
//   }
// }
