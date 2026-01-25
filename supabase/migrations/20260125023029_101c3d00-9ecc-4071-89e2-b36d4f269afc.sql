-- =====================================================
-- SHOPIFY STORE OPS RAG + AGENT SCHEMA
-- =====================================================

-- Create enum for RAG namespace types
CREATE TYPE public.ops_rag_namespace AS ENUM (
  'shopify_docs',
  'store_state',
  'sop_uploads'
);

-- Create enum for health check status
CREATE TYPE public.health_check_status AS ENUM (
  'ok',
  'warn',
  'critical',
  'unknown'
);

-- Create enum for ops action status
CREATE TYPE public.ops_action_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'executed',
  'failed',
  'rolled_back'
);

-- Create enum for health check category
CREATE TYPE public.health_check_category AS ENUM (
  'storefront_theme',
  'checkout_payments',
  'catalog_inventory',
  'orders_fulfillment',
  'apps_integrations',
  'performance_seo'
);

-- =====================================================
-- OPS RAG KNOWLEDGE BASE
-- =====================================================
CREATE TABLE public.ops_rag_knowledge (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  namespace public.ops_rag_namespace NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_url TEXT,
  source_type TEXT,
  metadata JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ops_rag_knowledge ENABLE ROW LEVEL SECURITY;

-- Only authenticated admins can read/write
CREATE POLICY "Admins can manage ops rag knowledge"
ON public.ops_rag_knowledge
FOR ALL
USING (public.can_access_admin(auth.uid()))
WITH CHECK (public.can_access_admin(auth.uid()));

-- =====================================================
-- STORE STATE SNAPSHOTS
-- =====================================================
CREATE TABLE public.store_state_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_type TEXT NOT NULL,
  snapshot_data JSONB NOT NULL,
  diff_from_previous JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.store_state_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view store snapshots"
ON public.store_state_snapshots
FOR SELECT
USING (public.can_access_admin(auth.uid()));

CREATE POLICY "Admins can create store snapshots"
ON public.store_state_snapshots
FOR INSERT
WITH CHECK (public.can_access_admin(auth.uid()));

-- =====================================================
-- HEALTH CHECK RESULTS
-- =====================================================
CREATE TABLE public.ops_health_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category public.health_check_category NOT NULL,
  check_name TEXT NOT NULL,
  status public.health_check_status NOT NULL DEFAULT 'unknown',
  evidence JSONB DEFAULT '{}',
  likely_cause TEXT,
  suggested_fix TEXT,
  requires_approval BOOLEAN DEFAULT false,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.ops_health_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view health checks"
ON public.ops_health_checks
FOR SELECT
USING (public.can_access_admin(auth.uid()));

CREATE POLICY "System can insert health checks"
ON public.ops_health_checks
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update health checks"
ON public.ops_health_checks
FOR UPDATE
USING (true);

-- =====================================================
-- OPS ACTIONS (APPROVAL QUEUE)
-- =====================================================
CREATE TABLE public.ops_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action_type TEXT NOT NULL,
  action_title TEXT NOT NULL,
  action_description TEXT,
  target_resource TEXT,
  target_resource_id TEXT,
  planned_changes JSONB NOT NULL,
  risk_level TEXT DEFAULT 'low',
  rollback_plan TEXT,
  requires_confirmation TEXT,
  status public.ops_action_status NOT NULL DEFAULT 'pending',
  requested_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  executed_at TIMESTAMPTZ,
  before_snapshot JSONB,
  after_snapshot JSONB,
  execution_result JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ops_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view ops actions"
ON public.ops_actions
FOR SELECT
USING (public.can_access_admin(auth.uid()));

CREATE POLICY "Admins can create ops actions"
ON public.ops_actions
FOR INSERT
WITH CHECK (public.can_access_admin(auth.uid()));

CREATE POLICY "Super admins can update ops actions"
ON public.ops_actions
FOR UPDATE
USING (public.is_super_admin(auth.uid()));

-- =====================================================
-- OPS AGENT CONVERSATIONS
-- =====================================================
CREATE TABLE public.ops_agent_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT,
  mode TEXT DEFAULT 'assist',
  messages JSONB DEFAULT '[]',
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ops_agent_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
ON public.ops_agent_conversations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
ON public.ops_agent_conversations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
ON public.ops_agent_conversations
FOR UPDATE
USING (auth.uid() = user_id);

-- =====================================================
-- SOP UPLOADS (User-uploaded documents)
-- =====================================================
CREATE TABLE public.ops_sop_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  storage_path TEXT NOT NULL,
  extracted_content TEXT,
  metadata JSONB DEFAULT '{}',
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ops_sop_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage sop uploads"
ON public.ops_sop_uploads
FOR ALL
USING (public.can_access_admin(auth.uid()))
WITH CHECK (public.can_access_admin(auth.uid()));

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_ops_rag_namespace ON public.ops_rag_knowledge(namespace);
CREATE INDEX idx_ops_rag_embedding ON public.ops_rag_knowledge USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_store_snapshots_type ON public.store_state_snapshots(snapshot_type);
CREATE INDEX idx_store_snapshots_created ON public.store_state_snapshots(created_at DESC);
CREATE INDEX idx_health_checks_category ON public.ops_health_checks(category);
CREATE INDEX idx_health_checks_status ON public.ops_health_checks(status);
CREATE INDEX idx_ops_actions_status ON public.ops_actions(status);

-- =====================================================
-- VECTOR SEARCH FUNCTION FOR OPS RAG
-- =====================================================
CREATE OR REPLACE FUNCTION public.search_ops_rag_knowledge(
  query_embedding vector,
  filter_namespace public.ops_rag_namespace DEFAULT NULL,
  match_threshold double precision DEFAULT 0.5,
  match_count integer DEFAULT 10
)
RETURNS TABLE(
  id uuid,
  namespace public.ops_rag_namespace,
  title text,
  content text,
  source_url text,
  tags text[],
  metadata jsonb,
  similarity double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.namespace,
    r.title,
    r.content,
    r.source_url,
    r.tags,
    r.metadata,
    1 - (r.embedding <=> query_embedding) AS similarity
  FROM public.ops_rag_knowledge r
  WHERE 
    r.embedding IS NOT NULL
    AND 1 - (r.embedding <=> query_embedding) > match_threshold
    AND (filter_namespace IS NULL OR r.namespace = filter_namespace)
  ORDER BY r.embedding <=> query_embedding
  LIMIT match_count;
END;
$function$;

-- =====================================================
-- UPDATE TIMESTAMP TRIGGERS
-- =====================================================
CREATE TRIGGER update_ops_rag_knowledge_updated_at
BEFORE UPDATE ON public.ops_rag_knowledge
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ops_actions_updated_at
BEFORE UPDATE ON public.ops_actions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ops_conversations_updated_at
BEFORE UPDATE ON public.ops_agent_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();