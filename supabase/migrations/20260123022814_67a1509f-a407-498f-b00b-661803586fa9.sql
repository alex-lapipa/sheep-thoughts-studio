-- Create a table to cache generated business plan sections
CREATE TABLE public.business_plan_sections (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_plan_sections ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all sections
CREATE POLICY "Allow authenticated users to read business plan sections"
  ON public.business_plan_sections
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow admin users to insert/update/delete sections
CREATE POLICY "Allow admin users to manage business plan sections"
  ON public.business_plan_sections
  FOR ALL
  TO authenticated
  USING (public.can_access_admin(auth.uid()))
  WITH CHECK (public.can_access_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_business_plan_sections_updated_at
  BEFORE UPDATE ON public.business_plan_sections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();