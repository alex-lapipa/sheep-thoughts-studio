-- Add scenario column to business_plan_sections for storing multiple scenarios
ALTER TABLE public.business_plan_sections 
ADD COLUMN IF NOT EXISTS scenario TEXT NOT NULL DEFAULT 'base';

-- Drop the existing primary key
ALTER TABLE public.business_plan_sections DROP CONSTRAINT business_plan_sections_pkey;

-- Create a composite primary key with id and scenario
ALTER TABLE public.business_plan_sections 
ADD PRIMARY KEY (id, scenario);