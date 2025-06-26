-- Add missing estimated_arrival_time column to rides table
-- Run this in Supabase SQL Editor to fix the ride creation error

ALTER TABLE rides ADD COLUMN IF NOT EXISTS estimated_arrival_time TIMESTAMP WITH TIME ZONE;

-- Add comment for documentation
COMMENT ON COLUMN rides.estimated_arrival_time IS 'Estimated arrival time calculated from departure time and route duration';

-- Create index for better performance when querying by estimated arrival time
CREATE INDEX IF NOT EXISTS idx_rides_estimated_arrival_time ON rides(estimated_arrival_time);
