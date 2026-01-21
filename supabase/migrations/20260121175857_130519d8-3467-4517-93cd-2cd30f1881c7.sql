-- =============================================================
-- BUBBLESHEEP OPS: RBAC + AUDIT + SHOPIFY + POD SCHEMA
-- =============================================================

-- 1) RBAC: User Roles Enum and Table
-- =============================================================
CREATE TYPE public.user_role AS ENUM ('admin', 'ops', 'merch', 'readonly');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL DEFAULT 'readonly',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Check if user has any admin-level role
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  )
$$;

-- RLS: Only admins can manage roles
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Users can view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2) AUDIT LOG TABLE
-- =============================================================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  before_data JSONB,
  after_data JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins and ops can view audit logs
CREATE POLICY "Admins and ops can view audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
  public.is_admin(auth.uid()) OR 
  public.has_role(auth.uid(), 'ops')
);

-- 3) SHOPIFY SETTINGS TABLE
-- =============================================================
CREATE TABLE public.shopify_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_domain TEXT NOT NULL,
  api_version TEXT NOT NULL DEFAULT '2024-01',
  default_location_id TEXT,
  webhook_secret TEXT,
  scopes TEXT[],
  last_api_call TIMESTAMPTZ,
  last_api_status TEXT,
  oauth_state TEXT,
  is_connected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shopify_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage Shopify settings
CREATE POLICY "Admins can manage Shopify settings"
ON public.shopify_settings
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 4) SHOPIFY WEBHOOKS TABLE
-- =============================================================
CREATE TYPE public.webhook_status AS ENUM ('pending', 'processed', 'failed', 'retrying');

CREATE TABLE public.shopify_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  shopify_webhook_id TEXT,
  payload JSONB NOT NULL,
  headers JSONB,
  status webhook_status NOT NULL DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  error_message TEXT,
  idempotency_key TEXT UNIQUE,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_webhooks_status ON public.shopify_webhooks(status);
CREATE INDEX idx_webhooks_topic ON public.shopify_webhooks(topic);
CREATE INDEX idx_webhooks_created ON public.shopify_webhooks(created_at DESC);

ALTER TABLE public.shopify_webhooks ENABLE ROW LEVEL SECURITY;

-- Admins and ops can view webhooks
CREATE POLICY "Admins and ops can view webhooks"
ON public.shopify_webhooks
FOR SELECT
TO authenticated
USING (
  public.is_admin(auth.uid()) OR 
  public.has_role(auth.uid(), 'ops')
);

-- 5) POD PROVIDERS TABLE
-- =============================================================
CREATE TYPE public.pod_provider_type AS ENUM ('printful', 'printify', 'gelato');
CREATE TYPE public.pod_connection_status AS ENUM ('connected', 'disconnected', 'error', 'pending');

CREATE TABLE public.pod_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider pod_provider_type NOT NULL,
  name TEXT NOT NULL,
  api_key_name TEXT, -- Reference to secret name, not actual key
  status pod_connection_status NOT NULL DEFAULT 'disconnected',
  last_sync_at TIMESTAMPTZ,
  last_sync_status TEXT,
  webhook_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider)
);

ALTER TABLE public.pod_providers ENABLE ROW LEVEL SECURITY;

-- Admins can manage POD providers
CREATE POLICY "Admins can manage POD providers"
ON public.pod_providers
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Merch can view POD providers
CREATE POLICY "Merch can view POD providers"
ON public.pod_providers
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'merch') OR
  public.has_role(auth.uid(), 'ops')
);

-- 6) VARIANT MAPPINGS TABLE
-- =============================================================
CREATE TYPE public.mapping_status AS ENUM ('ok', 'missing_file', 'missing_variant', 'mismatch', 'unmapped');

CREATE TABLE public.variant_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_product_id TEXT NOT NULL,
  shopify_variant_id TEXT NOT NULL,
  shopify_sku TEXT,
  shopify_title TEXT,
  shopify_options JSONB,
  pod_provider pod_provider_type,
  pod_product_id TEXT,
  pod_variant_id TEXT,
  pod_template_id TEXT,
  print_files JSONB DEFAULT '{}'::jsonb, -- { front: url, back: url, etc }
  status mapping_status NOT NULL DEFAULT 'unmapped',
  last_validated_at TIMESTAMPTZ,
  validation_errors TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(shopify_variant_id)
);

CREATE INDEX idx_mappings_shopify_product ON public.variant_mappings(shopify_product_id);
CREATE INDEX idx_mappings_status ON public.variant_mappings(status);
CREATE INDEX idx_mappings_provider ON public.variant_mappings(pod_provider);

ALTER TABLE public.variant_mappings ENABLE ROW LEVEL SECURITY;

-- Admins and merch can manage mappings
CREATE POLICY "Admins and merch can manage mappings"
ON public.variant_mappings
FOR ALL
TO authenticated
USING (
  public.is_admin(auth.uid()) OR 
  public.has_role(auth.uid(), 'merch')
)
WITH CHECK (
  public.is_admin(auth.uid()) OR 
  public.has_role(auth.uid(), 'merch')
);

-- Ops can view mappings
CREATE POLICY "Ops can view mappings"
ON public.variant_mappings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'ops'));

-- 7) POD JOBS TABLE (Order line items sent to POD)
-- =============================================================
CREATE TYPE public.pod_job_status AS ENUM (
  'not_sent', 'queued', 'in_production', 'shipped', 'delivered', 'error', 'cancelled'
);

CREATE TABLE public.pod_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_order_id TEXT NOT NULL,
  shopify_order_name TEXT,
  shopify_line_item_id TEXT NOT NULL,
  pod_provider pod_provider_type NOT NULL,
  pod_order_id TEXT,
  pod_line_item_id TEXT,
  variant_mapping_id UUID REFERENCES public.variant_mappings(id),
  status pod_job_status NOT NULL DEFAULT 'not_sent',
  tracking_number TEXT,
  tracking_url TEXT,
  carrier TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  last_status_check TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(shopify_line_item_id)
);

CREATE INDEX idx_pod_jobs_order ON public.pod_jobs(shopify_order_id);
CREATE INDEX idx_pod_jobs_status ON public.pod_jobs(status);
CREATE INDEX idx_pod_jobs_provider ON public.pod_jobs(pod_provider);

ALTER TABLE public.pod_jobs ENABLE ROW LEVEL SECURITY;

-- Admins and ops can manage POD jobs
CREATE POLICY "Admins and ops can manage POD jobs"
ON public.pod_jobs
FOR ALL
TO authenticated
USING (
  public.is_admin(auth.uid()) OR 
  public.has_role(auth.uid(), 'ops')
)
WITH CHECK (
  public.is_admin(auth.uid()) OR 
  public.has_role(auth.uid(), 'ops')
);

-- Merch can view POD jobs
CREATE POLICY "Merch can view POD jobs"
ON public.pod_jobs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'merch'));

-- 8) EXCEPTIONS QUEUE TABLE
-- =============================================================
CREATE TYPE public.exception_type AS ENUM (
  'address_issue', 'pod_failure', 'unmapped_variant', 'missing_print_file', 
  'payment_issue', 'inventory_issue', 'other'
);
CREATE TYPE public.exception_status AS ENUM ('open', 'in_progress', 'resolved', 'ignored');

CREATE TABLE public.exceptions_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type exception_type NOT NULL,
  status exception_status NOT NULL DEFAULT 'open',
  severity INTEGER NOT NULL DEFAULT 1, -- 1=low, 2=medium, 3=high, 4=critical
  title TEXT NOT NULL,
  description TEXT,
  entity_type TEXT, -- order, product, variant, pod_job
  entity_id TEXT,
  shopify_order_id TEXT,
  shopify_product_id TEXT,
  pod_job_id UUID REFERENCES public.pod_jobs(id),
  suggested_action TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_exceptions_status ON public.exceptions_queue(status);
CREATE INDEX idx_exceptions_type ON public.exceptions_queue(type);
CREATE INDEX idx_exceptions_assigned ON public.exceptions_queue(assigned_to);
CREATE INDEX idx_exceptions_order ON public.exceptions_queue(shopify_order_id);

ALTER TABLE public.exceptions_queue ENABLE ROW LEVEL SECURITY;

-- Admins and ops can manage exceptions
CREATE POLICY "Admins and ops can manage exceptions"
ON public.exceptions_queue
FOR ALL
TO authenticated
USING (
  public.is_admin(auth.uid()) OR 
  public.has_role(auth.uid(), 'ops')
)
WITH CHECK (
  public.is_admin(auth.uid()) OR 
  public.has_role(auth.uid(), 'ops')
);

-- Merch can view exceptions related to products
CREATE POLICY "Merch can view product exceptions"
ON public.exceptions_queue
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'merch') AND 
  entity_type IN ('product', 'variant')
);

-- 9) DROPS TABLE
-- =============================================================
CREATE TABLE public.drops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  tag_value TEXT NOT NULL, -- e.g., 'drop-01'
  mode_tag TEXT, -- innocent, concerned, triggered, savage, nuclear
  is_active BOOLEAN DEFAULT true,
  checklist JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.drops ENABLE ROW LEVEL SECURITY;

-- Admins and merch can manage drops
CREATE POLICY "Admins and merch can manage drops"
ON public.drops
FOR ALL
TO authenticated
USING (
  public.is_admin(auth.uid()) OR 
  public.has_role(auth.uid(), 'merch')
)
WITH CHECK (
  public.is_admin(auth.uid()) OR 
  public.has_role(auth.uid(), 'merch')
);

-- Ops and readonly can view drops
CREATE POLICY "Ops and readonly can view drops"
ON public.drops
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'ops') OR 
  public.has_role(auth.uid(), 'readonly')
);

-- 10) PRICING RULES TABLE
-- =============================================================
CREATE TABLE public.pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  product_type TEXT, -- tee, hoodie, cap, mug, tote, or null for all
  pod_provider pod_provider_type,
  base_cost DECIMAL(10,2),
  margin_type TEXT NOT NULL DEFAULT 'percentage', -- percentage or fixed
  margin_value DECIMAL(10,2) NOT NULL,
  rounding_rule TEXT DEFAULT 'x.99', -- x.99, x.95, none
  min_price DECIMAL(10,2),
  max_price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;

-- Admins and merch can manage pricing rules
CREATE POLICY "Admins and merch can manage pricing rules"
ON public.pricing_rules
FOR ALL
TO authenticated
USING (
  public.is_admin(auth.uid()) OR 
  public.has_role(auth.uid(), 'merch')
)
WITH CHECK (
  public.is_admin(auth.uid()) OR 
  public.has_role(auth.uid(), 'merch')
);

-- 11) TRIGGERS FOR updated_at
-- =============================================================
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shopify_settings_updated_at
  BEFORE UPDATE ON public.shopify_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pod_providers_updated_at
  BEFORE UPDATE ON public.pod_providers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_variant_mappings_updated_at
  BEFORE UPDATE ON public.variant_mappings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pod_jobs_updated_at
  BEFORE UPDATE ON public.pod_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exceptions_updated_at
  BEFORE UPDATE ON public.exceptions_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_drops_updated_at
  BEFORE UPDATE ON public.drops
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pricing_rules_updated_at
  BEFORE UPDATE ON public.pricing_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();