"use server";

import { createRide as createRideFromLib } from "@/lib/actions/rides";

export async function createRide(userId: string, formData: FormData) {
  // Pass the userId directly to the lib function
  return createRideFromLib(userId, formData);
}
