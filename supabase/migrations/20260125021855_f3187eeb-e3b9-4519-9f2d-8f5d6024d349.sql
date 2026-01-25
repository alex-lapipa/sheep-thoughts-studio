-- Create product_designs table to store design studio work
CREATE TABLE IF NOT EXISTS public.product_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  base_product_id TEXT NOT NULL,
  base_product_title TEXT NOT NULL,
  design_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'synced', 'published', 'archived')),
  shopify_product_id TEXT,
  pod_provider TEXT CHECK (pod_provider IS NULL OR pod_provider IN ('printful', 'printify', 'gelato')),
  pod_template_id TEXT,
  synced_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_designs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins and merch can manage designs"
  ON public.product_designs
  FOR ALL
  USING (is_admin(auth.uid()) OR has_role(auth.uid(), 'merch'::user_role))
  WITH CHECK (is_admin(auth.uid()) OR has_role(auth.uid(), 'merch'::user_role));

CREATE POLICY "Ops can view designs"
  ON public.product_designs
  FOR SELECT
  USING (has_role(auth.uid(), 'ops'::user_role));

-- Create index for faster lookups
CREATE INDEX idx_product_designs_status ON public.product_designs(status);
CREATE INDEX idx_product_designs_created_by ON public.product_designs(created_by);

-- Add trigger for updated_at
CREATE TRIGGER update_product_designs_updated_at
  BEFORE UPDATE ON public.product_designs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();