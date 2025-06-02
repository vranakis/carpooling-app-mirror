-- Enhanced Carpooling App Database Migration
-- Run this in Supabase SQL Editor to add Google Maps integration fields

-- Add new columns to rides table for Google Maps integration
ALTER TABLE rides ADD COLUMN IF NOT EXISTS origin_place_id TEXT;
ALTER TABLE rides ADD COLUMN IF NOT EXISTS destination_place_id TEXT;
ALTER TABLE rides ADD COLUMN IF NOT EXISTS origin_coordinates GEOGRAPHY(POINT);
ALTER TABLE rides ADD COLUMN IF NOT EXISTS destination_coordinates GEOGRAPHY(POINT);
ALTER TABLE rides ADD COLUMN IF NOT EXISTS route_distance INTEGER; -- in meters
ALTER TABLE rides ADD COLUMN IF NOT EXISTS route_duration INTEGER; -- in seconds
ALTER TABLE rides ADD COLUMN IF NOT EXISTS route_polyline TEXT; -- encoded polyline

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rides_origin_place_id ON rides(origin_place_id);
CREATE INDEX IF NOT EXISTS idx_rides_destination_place_id ON rides(destination_place_id);
CREATE INDEX IF NOT EXISTS idx_rides_origin_coordinates ON rides USING GIST(origin_coordinates);
CREATE INDEX IF NOT EXISTS idx_rides_destination_coordinates ON rides USING GIST(destination_coordinates);

-- Create table for route segments (for advanced route matching - Step 3)
CREATE TABLE IF NOT EXISTS route_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  start_place_id TEXT,
  end_place_id TEXT,
  start_coordinates GEOGRAPHY(POINT),
  end_coordinates GEOGRAPHY(POINT),
  segment_order INTEGER NOT NULL,
  distance_meters INTEGER,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for route segments
CREATE INDEX IF NOT EXISTS idx_route_segments_ride_id ON route_segments(ride_id);
CREATE INDEX IF NOT EXISTS idx_route_segments_start_coords ON route_segments USING GIST(start_coordinates);
CREATE INDEX IF NOT EXISTS idx_route_segments_end_coords ON route_segments USING GIST(end_coordinates);
CREATE INDEX IF NOT EXISTS idx_route_segments_order ON route_segments(ride_id, segment_order);

-- Enable PostGIS extension if not already enabled (for spatial queries)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add comments for documentation
COMMENT ON COLUMN rides.origin_place_id IS 'Google Places API place ID for origin';
COMMENT ON COLUMN rides.destination_place_id IS 'Google Places API place ID for destination';
COMMENT ON COLUMN rides.origin_coordinates IS 'Geographic coordinates of origin (lat, lng)';
COMMENT ON COLUMN rides.destination_coordinates IS 'Geographic coordinates of destination (lat, lng)';
COMMENT ON COLUMN rides.route_distance IS 'Route distance in meters from Google Directions API';
COMMENT ON COLUMN rides.route_duration IS 'Route duration in seconds from Google Directions API';
COMMENT ON COLUMN rides.route_polyline IS 'Encoded polyline string from Google Directions API';

COMMENT ON TABLE route_segments IS 'Route segments for advanced route matching (bus stop functionality)';
