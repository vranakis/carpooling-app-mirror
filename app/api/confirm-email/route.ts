// ⚠️ TEMPORARILY DISABLED - Supabase removed
// TODO: Re-implement with Clerk + Neon when ready

export default function DisabledFeature() {
  return null; // or throw new Error("Feature disabled")
}

// import { supabaseAdmin } from "@/lib/supabase/server"
// import { NextResponse } from "next/server"

// export async function POST(request: Request) {
//   try {
//     const { email } = await request.json()

//     if (!email) {
//       return NextResponse.json({ error: "Email is required" }, { status: 400 })
//     }

//     // Get the user by email
//     const { data: user, error: userError } = await supabaseAdmin.auth.admin.listUsers({
//       filter: {
//         email: email,
//       },
//     })

//     if (userError || !user.users.length) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 })
//     }

//     // Update the user to confirm their email
//     const { error } = await supabaseAdmin.auth.admin.updateUserById(user.users[0].id, { email_confirm: true })

//     if (error) {
//       return NextResponse.json({ error: error.message }, { status: 500 })
//     }

//     return NextResponse.json({ success: true })
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 500 })
//   }
// }
