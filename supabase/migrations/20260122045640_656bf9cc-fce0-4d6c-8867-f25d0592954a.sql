-- Create layout templates table for reusable block layouts
CREATE TABLE public.layout_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  use_count INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.layout_templates ENABLE ROW LEVEL SECURITY;

-- Public templates are viewable by everyone
CREATE POLICY "Public templates are viewable by all"
ON public.layout_templates
FOR SELECT
USING (is_public = true);

-- Authenticated users can view their own templates
CREATE POLICY "Users can view own templates"
ON public.layout_templates
FOR SELECT
TO authenticated
USING (created_by = auth.uid());

-- Authenticated users can create templates
CREATE POLICY "Users can create templates"
ON public.layout_templates
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

-- Users can update their own templates
CREATE POLICY "Users can update own templates"
ON public.layout_templates
FOR UPDATE
TO authenticated
USING (created_by = auth.uid());

-- Users can delete their own templates
CREATE POLICY "Users can delete own templates"
ON public.layout_templates
FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- Admins can manage all templates
CREATE POLICY "Admins can manage all templates"
ON public.layout_templates
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Create index for faster category lookups
CREATE INDEX idx_layout_templates_category ON public.layout_templates(category);
CREATE INDEX idx_layout_templates_public ON public.layout_templates(is_public) WHERE is_public = true;

-- Add updated_at trigger
CREATE TRIGGER update_layout_templates_updated_at
BEFORE UPDATE ON public.layout_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();