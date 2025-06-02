export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: string
          ride_id: string
          passenger_id: string
          seats_booked: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ride_id: string
          passenger_id: string
          seats_booked: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ride_id?: string
          passenger_id?: string
          seats_booked?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          ride_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ride_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ride_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          conversation_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          conversation_id?: string
          user_id?: string
          created_at?: string
        }
      }
      environmental_impact: {
        Row: {
          id: string
          user_id: string
          co2_saved: number
          rides_shared: number
          people_helped: number
          distance_shared: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          co2_saved?: number
          rides_shared?: number
          people_helped?: number
          distance_shared?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          co2_saved?: number
          rides_shared?: number
          people_helped?: number
          distance_shared?: number
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string
          ride_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          recipient_id: string
          ride_id: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          recipient_id?: string
          ride_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          first_name: string
          last_name: string
          avatar_url: string | null
          bio: string | null
          phone_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name: string
          last_name: string
          avatar_url?: string | null
          bio?: string | null
          phone_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          avatar_url?: string | null
          bio?: string | null
          phone_number?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      rides: {
        Row: {
          id: string
          driver_id: string
          vehicle_id: string | null
          origin: string
          destination: string
          departure_time: string
          estimated_arrival_time: string
          available_seats: number
          price: number
          description: string | null
          status: string
          created_at: string
          updated_at: string
          origin_place_id: string | null
          destination_place_id: string | null
          origin_coordinates: string | null
          destination_coordinates: string | null
          route_distance: number | null
          route_duration: number | null
          route_polyline: string | null
        }
        Insert: {
          id?: string
          driver_id: string
          vehicle_id?: string | null
          origin: string
          destination: string
          departure_time: string
          estimated_arrival_time: string
          available_seats: number
          price: number
          description?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          origin_place_id?: string | null
          destination_place_id?: string | null
          origin_coordinates?: string | null
          destination_coordinates?: string | null
          route_distance?: number | null
          route_duration?: number | null
          route_polyline?: string | null
        }
        Update: {
          id?: string
          driver_id?: string
          vehicle_id?: string | null
          origin?: string
          destination?: string
          departure_time?: string
          estimated_arrival_time?: string
          available_seats?: number
          price?: number
          description?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          origin_place_id?: string | null
          destination_place_id?: string | null
          origin_coordinates?: string | null
          destination_coordinates?: string | null
          route_distance?: number | null
          route_duration?: number | null
          route_polyline?: string | null
        }
      }
      vehicles: {
        Row: {
          id: string
          user_id: string
          make: string
          model: string
          year: number
          color: string
          seats: number
          license_plate: string
          fuel_type: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          make: string
          model: string
          year: number
          color: string
          seats: number
          license_plate: string
          fuel_type?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          make?: string
          model?: string
          year?: number
          color?: string
          seats?: number
          license_plate?: string
          fuel_type?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      route_segments: {
        Row: {
          id: string
          ride_id: string
          start_place_id: string | null
          end_place_id: string | null
          start_coordinates: string | null
          end_coordinates: string | null
          segment_order: number
          distance_meters: number | null
          duration_seconds: number | null
          created_at: string
        }
        Insert: {
          id?: string
          ride_id: string
          start_place_id?: string | null
          end_place_id?: string | null
          start_coordinates?: string | null
          end_coordinates?: string | null
          segment_order: number
          distance_meters?: number | null
          duration_seconds?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          ride_id?: string
          start_place_id?: string | null
          end_place_id?: string | null
          start_coordinates?: string | null
          end_coordinates?: string | null
          segment_order?: number
          distance_meters?: number | null
          duration_seconds?: number | null
          created_at?: string
        }
      }
    }
  }
}
