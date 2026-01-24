-- Create user_wishlists table for cloud sync
CREATE TABLE public.user_wishlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_wishlists ENABLE ROW LEVEL SECURITY;

-- Users can only access their own wishlist
CREATE POLICY "Users can view their own wishlist"
ON public.user_wishlists FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wishlist"
ON public.user_wishlists FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlist"
ON public.user_wishlists FOR UPDATE
USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_user_wishlists_updated_at
BEFORE UPDATE ON public.user_wishlists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();