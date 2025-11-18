// lib/database/helpers.ts
// Database helper functions - Works without authentication

import { queryNeon, queryNeonSingle } from "./client";

// ============================================
// TYPES
// ============================================

export interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  profile_photo?: string;
  rating: number;
  total_rides: number;
  created_at: string;
  updated_at: string;
}

export interface Ride {
  id: string;
  driver_id: string;
  origin: string;
  destination: string;
  origin_place_id?: string;
  destination_place_id?: string;
  departure_time: string;
  estimated_arrival_time?: string;
  available_seats: number;
  price_per_seat: number;
  route_distance?: number;
  route_duration?: number;
  route_polyline?: string;
  status: "active" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  ride_id: string;
  passenger_id: string;
  pickup_location?: string;
  dropoff_location?: string;
  seats_booked: number;
  total_price: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  created_at: string;
  updated_at: string;
}

// ============================================
// PROFILE FUNCTIONS
// ============================================

export async function getProfileById(userId: string): Promise<Profile | null> {
  return queryNeonSingle<Profile>("SELECT * FROM profiles WHERE id = $1", [
    userId,
  ]);
}

export async function createProfile(profile: {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
}): Promise<Profile> {
  const result = await queryNeon<Profile>(
    `INSERT INTO profiles (id, email, first_name, last_name, phone)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      profile.id,
      profile.email,
      profile.first_name,
      profile.last_name,
      profile.phone || null,
    ]
  );
  return result[0];
}

// ============================================
// RIDE FUNCTIONS
// ============================================

export async function createRide(ride: {
  driver_id: string;
  origin: string;
  destination: string;
  origin_place_id?: string;
  destination_place_id?: string;
  origin_lat?: number;
  origin_lng?: number;
  destination_lat?: number;
  destination_lng?: number;
  departure_time: Date;
  available_seats: number;
  price_per_seat: number;
  route_distance?: number;
  route_duration?: number;
  route_polyline?: string;
}): Promise<Ride> {
  const estimatedArrival = ride.route_duration
    ? new Date(ride.departure_time.getTime() + ride.route_duration * 1000)
    : null;

  // Build coordinates strings for SQL
  const originCoords =
    ride.origin_lat && ride.origin_lng
      ? `ST_SetSRID(ST_MakePoint(${ride.origin_lng}, ${ride.origin_lat}), 4326)::geography`
      : "NULL";

  const destCoords =
    ride.destination_lat && ride.destination_lng
      ? `ST_SetSRID(ST_MakePoint(${ride.destination_lng}, ${ride.destination_lat}), 4326)::geography`
      : "NULL";

  const result = await queryNeon<Ride>(
    `INSERT INTO rides (
      driver_id, origin, destination, origin_place_id, destination_place_id,
      origin_coordinates, destination_coordinates,
      departure_time, estimated_arrival_time, available_seats, price_per_seat,
      route_distance, route_duration, route_polyline
    ) VALUES ($1, $2, $3, $4, $5, ${originCoords}, ${destCoords}, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *`,
    [
      ride.driver_id,
      ride.origin,
      ride.destination,
      ride.origin_place_id || null,
      ride.destination_place_id || null,
      ride.departure_time,
      estimatedArrival,
      ride.available_seats,
      ride.price_per_seat,
      ride.route_distance || null,
      ride.route_duration || null,
      ride.route_polyline || null,
    ]
  );
  return result[0];
}

export async function getRideById(rideId: string): Promise<Ride | null> {
  return queryNeonSingle<Ride>(
    `SELECT 
      id, driver_id, origin, destination, origin_place_id, destination_place_id,
      ST_AsGeoJSON(origin_coordinates::geometry)::json as origin_coordinates,
      ST_AsGeoJSON(destination_coordinates::geometry)::json as destination_coordinates,
      departure_time, estimated_arrival_time, available_seats, price_per_seat,
      route_distance, route_duration, route_polyline, status, created_at, updated_at
    FROM rides 
    WHERE id = $1`,
    [rideId]
  );
}

export async function getAllRides(): Promise<Ride[]> {
  return queryNeon<Ride>(
    `SELECT 
      id, driver_id, origin, destination, origin_place_id, destination_place_id,
      ST_AsGeoJSON(origin_coordinates::geometry)::json as origin_coordinates,
      ST_AsGeoJSON(destination_coordinates::geometry)::json as destination_coordinates,
      departure_time, estimated_arrival_time, available_seats, price_per_seat,
      route_distance, route_duration, route_polyline, status, created_at, updated_at
    FROM rides 
    WHERE status = $1 
    ORDER BY departure_time DESC 
    LIMIT 50`,
    ["active"]
  );
}

export async function getRidesByDriver(driverId: string): Promise<Ride[]> {
  return queryNeon<Ride>(
    `SELECT 
      id, driver_id, origin, destination, origin_place_id, destination_place_id,
      ST_AsGeoJSON(origin_coordinates::geometry)::json as origin_coordinates,
      ST_AsGeoJSON(destination_coordinates::geometry)::json as destination_coordinates,
      departure_time, estimated_arrival_time, available_seats, price_per_seat,
      route_distance, route_duration, route_polyline, status, created_at, updated_at
    FROM rides 
    WHERE driver_id = $1 
    ORDER BY departure_time DESC`,
    [driverId]
  );
}

export async function searchRides(params: {
  origin_lat?: number;
  origin_lng?: number;
  destination_lat?: number;
  destination_lng?: number;
  max_distance_km?: number;
  departure_date?: Date;
  min_seats?: number;
}): Promise<Ride[]> {
  const maxDistance = (params.max_distance_km || 10) * 1000; // Convert to meters

  if (params.origin_lat && params.origin_lng) {
    // Use the built-in function from migration
    return queryNeon<Ride>(
      `SELECT r.* FROM find_rides_near_location($1, $2, $3, $4) f
       JOIN rides r ON r.id = f.ride_id
       WHERE r.available_seats >= $5`,
      [
        params.origin_lat,
        params.origin_lng,
        maxDistance,
        params.departure_date || new Date(),
        params.min_seats || 1,
      ]
    );
  }

  // Fallback: simple text search
  return queryNeon<Ride>(
    `SELECT * FROM rides 
     WHERE status = 'active' 
     AND departure_time >= $1 
     AND available_seats >= $2
     ORDER BY departure_time ASC
     LIMIT 50`,
    [params.departure_date || new Date(), params.min_seats || 1]
  );
}

// ============================================
// BOOKING FUNCTIONS
// ============================================

export async function createBooking(booking: {
  ride_id: string;
  passenger_id: string;
  pickup_location?: string;
  dropoff_location?: string;
  seats_booked: number;
  total_price: number;
}): Promise<Booking> {
  const result = await queryNeon<Booking>(
    `INSERT INTO bookings (
      ride_id, passenger_id, pickup_location, dropoff_location, 
      seats_booked, total_price, status
    ) VALUES ($1, $2, $3, $4, $5, $6, 'pending')
    RETURNING *`,
    [
      booking.ride_id,
      booking.passenger_id,
      booking.pickup_location || null,
      booking.dropoff_location || null,
      booking.seats_booked,
      booking.total_price,
    ]
  );
  return result[0];
}

export async function getBookingsByPassenger(
  passengerId: string
): Promise<Booking[]> {
  return queryNeon<Booking>(
    "SELECT * FROM bookings WHERE passenger_id = $1 ORDER BY created_at DESC",
    [passengerId]
  );
}

export async function getBookingsByRide(rideId: string): Promise<Booking[]> {
  return queryNeon<Booking>(
    "SELECT * FROM bookings WHERE ride_id = $1 ORDER BY created_at ASC",
    [rideId]
  );
}

export async function updateBookingStatus(
  bookingId: string,
  status: "pending" | "confirmed" | "cancelled" | "completed"
): Promise<Booking> {
  const result = await queryNeon<Booking>(
    "UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
    [status, bookingId]
  );
  return result[0];
}
