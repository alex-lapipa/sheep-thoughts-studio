-- Create changelog_entries table for What's New feature
CREATE TABLE public.changelog_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'feature',
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.changelog_entries ENABLE ROW LEVEL SECURITY;

-- Public can read published entries
CREATE POLICY "Published entries are publicly readable"
ON public.changelog_entries
FOR SELECT
USING (is_published = true);

-- Admins can view all entries
CREATE POLICY "Admins can view all changelog entries"
ON public.changelog_entries
FOR SELECT
USING (can_access_admin(auth.uid()));

-- Admins can manage entries
CREATE POLICY "Admins can insert changelog entries"
ON public.changelog_entries
FOR INSERT
WITH CHECK (can_access_admin(auth.uid()));

CREATE POLICY "Admins can update changelog entries"
ON public.changelog_entries
FOR UPDATE
USING (can_access_admin(auth.uid()))
WITH CHECK (can_access_admin(auth.uid()));

CREATE POLICY "Admins can delete changelog entries"
ON public.changelog_entries
FOR DELETE
USING (can_access_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_changelog_entries_updated_at
BEFORE UPDATE ON public.changelog_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();