-- Add missing columns to properties table
-- Run this AFTER running the main database setup script

-- Add amenities column as JSONB array to store amenities list
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '[]'::jsonb;

-- Add deposit_amount column that the form expects
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(12,2);

-- Update the type constraint to include all property types from the form
ALTER TABLE public.properties 
DROP CONSTRAINT IF EXISTS properties_type_check;

ALTER TABLE public.properties 
ADD CONSTRAINT properties_type_check 
CHECK (type IN ('apartment', 'house', 'maisonette', 'bedsitter', 'studio', 'commercial', 'land', 'other'));

-- Update status constraint to match form values
ALTER TABLE public.properties 
DROP CONSTRAINT IF EXISTS properties_status_check;

ALTER TABLE public.properties 
ADD CONSTRAINT properties_status_check 
CHECK (status IN ('vacant', 'occupied', 'maintenance', 'available'));
