-- Create storage bucket for Bubbles illustrations
INSERT INTO storage.buckets (id, name, public)
VALUES ('bubbles-illustrations', 'bubbles-illustrations', true);

-- Create RLS policies for the bucket
CREATE POLICY "Authenticated users can upload illustrations"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'bubbles-illustrations');

CREATE POLICY "Anyone can view illustrations"
ON storage.objects FOR SELECT
USING (bucket_id = 'bubbles-illustrations');

CREATE POLICY "Authenticated users can update their illustrations"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'bubbles-illustrations');

CREATE POLICY "Authenticated users can delete illustrations"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'bubbles-illustrations');

-- Create table to track generated illustrations
CREATE TABLE public.generated_illustrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  posture TEXT NOT NULL,
  accessory TEXT NOT NULL,
  weather TEXT NOT NULL,
  expression TEXT NOT NULL,
  style TEXT NOT NULL,
  aspect_ratio TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_favorite BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  usage_count INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.generated_illustrations ENABLE ROW LEVEL SECURITY;

-- RLS policies for illustrations table
CREATE POLICY "Anyone can view illustrations"
ON public.generated_illustrations FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert illustrations"
ON public.generated_illustrations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own illustrations"
ON public.generated_illustrations FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own illustrations"
ON public.generated_illustrations FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

-- Create index for common queries
CREATE INDEX idx_illustrations_created_at ON public.generated_illustrations(created_at DESC);
CREATE INDEX idx_illustrations_style ON public.generated_illustrations(style);
CREATE INDEX idx_illustrations_posture ON public.generated_illustrations(posture);