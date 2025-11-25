// "use client";

// import type { Metadata } from "next";
// import {
//   getUserEnvironmentalImpact,
//   getGlobalEnvironmentalImpact,
// } from "@/lib/actions/environmental-impact";
// import { ImpactCard } from "@/components/impact/impact-card";
// import { ImpactChart } from "@/components/impact/impact-chart";
// import { Car, Leaf, Users, Route } from "lucide-react";

// export const metadata: Metadata = {
//   title: "Environmental Impact | Carpooling App",
//   description:
//     "Track your positive impact on the environment through carpooling",
// };

// export default async function ImpactPage() {
//   const { data: userImpact, error: userError } =
//     await getUserEnvironmentalImpact();
//   const { data: globalImpact, error: globalError } =
//     await getGlobalEnvironmentalImpact();

//   const hasError = userError || globalError;

//   return (
//     <div className="container py-6 space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold tracking-tight">
//           Environmental Impact
//         </h1>
//         <p className="text-muted-foreground">
//           Track your positive impact on the environment through carpooling
//         </p>
//       </div>

//       {hasError ? (
//         <div className="p-4 border rounded-md bg-red-50 text-red-800">
//           <p>
//             There was an error loading your environmental impact data. Please
//             try again later.
//           </p>
//           {userError && <p className="text-sm mt-2">Error: {userError}</p>}
//           {globalError && <p className="text-sm mt-2">Error: {globalError}</p>}
//         </div>
//       ) : (
//         <>
//           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//             <ImpactCard
//               title="CO2 Saved"
//               value={`${userImpact?.co2_saved || 0} kg`}
//               description="Carbon dioxide emissions prevented"
//               icon={<Leaf />}
//               className="bg-gradient-to-br from-green-50 to-emerald-50 border-emerald-100"
//             />
//             <ImpactCard
//               title="Rides Shared"
//               value={userImpact?.rides_shared || 0}
//               description="Total rides you've shared"
//               icon={<Car />}
//               className="bg-gradient-to-br from-blue-50 to-sky-50 border-blue-100"
//             />
//             <ImpactCard
//               title="People Helped"
//               value={userImpact?.people_helped || 0}
//               description="Passengers you've transported"
//               icon={<Users />}
//               className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-100"
//             />
//             <ImpactCard
//               title="Distance Shared"
//               value={`${userImpact?.distance_shared || 0} km`}
//               description="Total distance of shared rides"
//               icon={<Route />}
//               className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-100"
//             />
//           </div>

//           <ImpactChart
//             data={{
//               co2Saved: Number(userImpact?.co2_saved || 0),
//               ridesShared: Number(userImpact?.rides_shared || 0),
//               peopleHelped: Number(userImpact?.people_helped || 0),
//               distanceShared: Number(userImpact?.distance_shared || 0),
//             }}
//             className="mt-6"
//           />

//           <div className="mt-10">
//             <h2 className="text-2xl font-bold tracking-tight mb-4">
//               Community Impact
//             </h2>
//             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//               <ImpactCard
//                 title="Total CO2 Saved"
//                 value={`${globalImpact?.co2_saved || 0} kg`}
//                 description="By all users combined"
//                 icon={<Leaf />}
//                 className="bg-gradient-to-br from-green-100 to-emerald-100 border-emerald-200"
//               />
//               <ImpactCard
//                 title="Total Rides"
//                 value={globalImpact?.rides_shared || 0}
//                 description="Shared across the platform"
//                 icon={<Car />}
//                 className="bg-gradient-to-br from-blue-100 to-sky-100 border-blue-200"
//               />
//               <ImpactCard
//                 title="People Transported"
//                 value={globalImpact?.people_helped || 0}
//                 description="Total passengers helped"
//                 icon={<Users />}
//                 className="bg-gradient-to-br from-amber-100 to-yellow-100 border-amber-200"
//               />
//               <ImpactCard
//                 title="Total Distance"
//                 value={`${globalImpact?.distance_shared || 0} km`}
//                 description="Combined shared journey distance"
//                 icon={<Route />}
//                 className="bg-gradient-to-br from-purple-100 to-violet-100 border-purple-200"
//               />
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }
