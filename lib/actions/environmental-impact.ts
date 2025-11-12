// ⚠️ TEMPORARILY DISABLED - Supabase removed
// TODO: Re-implement with Clerk + Neon when ready

export default function DisabledFeature() {
  return null; // or throw new Error("Feature disabled")
}

// Comment out or delete everything below
/*
... rest of file ...
*/

// "use server"

// import { createServerClient } from "@/lib/supabase/server"
// import { cookies } from "next/headers"

// export async function getUserEnvironmentalImpact() {
//   const cookieStore = cookies()
//   const supabase = createServerClient(cookieStore)

//   const { data: session } = await supabase.auth.getSession()

//   if (!session.session?.user) {
//     return { error: "Not authenticated" }
//   }

//   const userId = session.session.user.id

//   const { data, error } = await supabase.from("environmental_impact").select("*").eq("user_id", userId).single()

//   if (error) {
//     // If no record exists, create one with default values
//     if (error.code === "PGRST116") {
//       const { data: newRecord, error: createError } = await supabase
//         .from("environmental_impact")
//         .insert({
//           user_id: userId,
//           co2_saved: 0,
//           rides_shared: 0,
//           people_helped: 0,
//           distance_shared: 0,
//         })
//         .select()
//         .single()

//       if (createError) {
//         return { error: createError.message }
//       }

//       return { data: newRecord }
//     }

//     return { error: error.message }
//   }

//   return { data }
// }

// export async function getGlobalEnvironmentalImpact() {
//   const cookieStore = cookies()
//   const supabase = createServerClient(cookieStore)

//   const { data, error } = await supabase
//     .from("environmental_impact")
//     .select("co2_saved, rides_shared, people_helped, distance_shared")

//   if (error) {
//     return { error: error.message }
//   }

//   // Calculate totals
//   const totals = data.reduce(
//     (acc, curr) => {
//       return {
//         co2_saved: acc.co2_saved + Number(curr.co2_saved || 0),
//         rides_shared: acc.rides_shared + Number(curr.rides_shared || 0),
//         people_helped: acc.people_helped + Number(curr.people_helped || 0),
//         distance_shared: acc.distance_shared + Number(curr.distance_shared || 0),
//       }
//     },
//     {
//       co2_saved: 0,
//       rides_shared: 0,
//       people_helped: 0,
//       distance_shared: 0,
//     },
//   )

//   return { data: totals }
// }
