-- Fix profiles table to prevent duplicate entries and ensure proper constraints
-- Run this in Supabase SQL Editor

-- First, remove any duplicate profiles (keep the most recent one)
WITH duplicates AS (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY id ORDER BY updated_at DESC) as rn
  FROM profiles
)
DELETE FROM profiles 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Add unique constraint on id if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_id_unique'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_id_unique UNIQUE (id);
  END IF;
END $$;

-- Ensure the profiles table has proper RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create a function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, created_at, updated_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent duplicate inserts
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
