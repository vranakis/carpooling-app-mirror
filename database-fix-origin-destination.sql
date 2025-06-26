-- Fix missing origin and destination columns in rides table
-- Run this in Supabase SQL Editor to fix the PGRST204 errors

-- Add missing origin and destination columns
ALTER TABLE rides ADD COLUMN IF NOT EXISTS origin TEXT;
ALTER TABLE rides ADD COLUMN IF NOT EXISTS destination TEXT;

-- Add missing estimated_arrival_time column if not already added
ALTER TABLE rides ADD COLUMN IF NOT EXISTS estimated_arrival_time TIMESTAMP WITH TIME ZONE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rides_origin ON rides(origin);
CREATE INDEX IF NOT EXISTS idx_rides_destination ON rides(destination);
CREATE INDEX IF NOT EXISTS idx_rides_estimated_arrival_time ON rides(estimated_arrival_time);

-- Add comments for documentation
COMMENT ON COLUMN rides.origin IS 'Origin location for the ride';
COMMENT ON COLUMN rides.destination IS 'Destination location for the ride';
COMMENT ON COLUMN rides.estimated_arrival_time IS 'Estimated arrival time calculated from departure time and route duration';
