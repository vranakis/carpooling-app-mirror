// ⚠️ TEMPORARILY DISABLED - Supabase removed
// TODO: Re-implement with Clerk + Neon when ready

export default function DisabledFeature() {
  return null; // or throw new Error("Feature disabled")
}

// "use server"

// import { revalidatePath } from "next/cache"
// import { redirect } from "next/navigation"
// import { createClient } from "@/lib/supabase/server"
// import { getCurrentUser } from "./auth"

// export async function createVehicle(formData: FormData) {
//   try {
//     const user = await getCurrentUser()

//     if (!user) {
//       throw new Error("You must be logged in to add a vehicle")
//     }

//     const make = formData.get("make") as string
//     const model = formData.get("model") as string
//     const year = Number.parseInt(formData.get("year") as string)
//     const color = formData.get("color") as string
//     const seats = Number.parseInt(formData.get("seats") as string)
//     const licensePlate = formData.get("licensePlate") as string
//     const fuelType = formData.get("fuelType") as string

//     // Validation
//     if (!make || !model || !year || !color || !seats || !licensePlate || !fuelType) {
//       throw new Error("All fields are required")
//     }

//     if (year < 1990 || year > new Date().getFullYear() + 1) {
//       throw new Error("Year must be between 1990 and next year")
//     }

//     if (seats < 2 || seats > 8) {
//       throw new Error("Seats must be between 2 and 8")
//     }

//     const supabase = await createClient()

//     // First, let's check what columns exist in the vehicles table
//     const { data: existingVehicles, error: checkError } = await supabase.from("vehicles").select("*").limit(1)

//     console.log("Existing vehicles structure:", existingVehicles)

//     // Insert the vehicle with only the columns that exist
//     const vehicleData: any = {
//       user_id: user.id,
//       make,
//       model,
//       year,
//       color,
//       license_plate: licensePlate,
//     }

//     // Add optional columns if they exist in the table
//     // Check if seats and fuel_type columns exist by trying to insert
//     const { data: vehicle, error } = await supabase.from("vehicles").insert(vehicleData).select().single()

//     if (error) {
//       console.error("Error creating vehicle:", error)
//       throw new Error(`Failed to create vehicle: ${error.message}`)
//     }

//     console.log("Vehicle created successfully:", vehicle)

//     // Revalidate multiple paths to ensure the data is fresh
//     revalidatePath("/profile")
//     revalidatePath("/profile/vehicles")
//     revalidatePath("/")
//   } catch (error) {
//     console.error("Unexpected error creating vehicle:", error)
//     throw error
//   }

//   // Redirect with success message
//   redirect("/profile?tab=vehicles&success=vehicle-added")
// }

// export async function getUserVehicles() {
//   try {
//     const user = await getCurrentUser()

//     if (!user) {
//       console.log("No user found")
//       return []
//     }

//     const supabase = await createClient()

//     const { data: vehicles, error } = await supabase
//       .from("vehicles")
//       .select("*")
//       .eq("user_id", user.id)
//       .order("created_at", { ascending: false })

//     if (error) {
//       console.error("Error fetching vehicles:", error)
//       return []
//     }

//     console.log("Fetched vehicles for user:", user.id, vehicles)
//     return vehicles || []
//   } catch (error) {
//     console.error("Unexpected error fetching vehicles:", error)
//     return []
//   }
// }

// export async function updateVehicle(vehicleId: string, formData: FormData) {
//   const user = await getCurrentUser()

//   if (!user) {
//     return { error: "You must be logged in to update a vehicle" }
//   }

//   const make = formData.get("make") as string
//   const model = formData.get("model") as string
//   const year = Number.parseInt(formData.get("year") as string)
//   const color = formData.get("color") as string
//   const seats = Number.parseInt(formData.get("seats") as string)
//   const licensePlate = formData.get("licensePlate") as string
//   const fuelType = formData.get("fuelType") as string

//   const supabase = await createClient()

//   const { error } = await supabase
//     .from("vehicles")
//     .update({
//       make,
//       model,
//       year,
//       color,
//       license_plate: licensePlate,
//     })
//     .eq("id", vehicleId)
//     .eq("user_id", user.id)

//   if (error) {
//     console.error("Error updating vehicle:", error)
//     return { error: error.message }
//   }

//   revalidatePath("/profile")
//   return { success: true }
// }

// export async function deleteVehicle(vehicleId: string) {
//   const user = await getCurrentUser()

//   if (!user) {
//     return { error: "You must be logged in to delete a vehicle" }
//   }

//   const supabase = await createClient()

//   const { error } = await supabase.from("vehicles").delete().eq("id", vehicleId).eq("user_id", user.id)

//   if (error) {
//     console.error("Error deleting vehicle:", error)
//     return { error: error.message }
//   }

//   revalidatePath("/profile")
//   return { success: true }
// }
