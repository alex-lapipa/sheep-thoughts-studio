-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the update_updated_at function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create enum for knowledge categories
CREATE TYPE public.bubbles_knowledge_category AS ENUM (
  'character_bible',
  'psychology',
  'humor_mechanisms',
  'mode_system',
  'trigger_taxonomy',
  'writing_rules',
  'visual_identity',
  'brand_guidelines',
  'comedy_bible',
  'cross_cultural',
  'example_content',
  'research'
);

-- Create enum for modes
CREATE TYPE public.bubbles_mode AS ENUM (
  'innocent',
  'concerned',
  'triggered',
  'savage',
  'nuclear'
);

-- Main knowledge base table with vector embeddings
CREATE TABLE public.bubbles_knowledge (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category public.bubbles_knowledge_category NOT NULL,
  mode public.bubbles_mode,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  embedding vector(1536),
  source_document TEXT,
  section_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Thought bubbles table for AI-generated and curated content
CREATE TABLE public.bubbles_thoughts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  mode public.bubbles_mode NOT NULL,
  trigger_category TEXT,
  is_curated BOOLEAN DEFAULT false,
  is_ai_generated BOOLEAN DEFAULT false,
  use_count INTEGER DEFAULT 0,
  rating NUMERIC(3,2),
  tags TEXT[] DEFAULT '{}',
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Scenario prompts for content generation
CREATE TABLE public.bubbles_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  start_mode public.bubbles_mode NOT NULL DEFAULT 'innocent',
  end_mode public.bubbles_mode NOT NULL DEFAULT 'savage',
  beats JSONB DEFAULT '[]',
  trigger_category TEXT,
  tags TEXT[] DEFAULT '{}',
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Trigger taxonomy table
CREATE TABLE public.bubbles_triggers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  internal_logic TEXT NOT NULL,
  example_scenario TEXT,
  example_bubbles TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for filtering
CREATE INDEX idx_bubbles_knowledge_category ON public.bubbles_knowledge (category);
CREATE INDEX idx_bubbles_knowledge_mode ON public.bubbles_knowledge (mode);
CREATE INDEX idx_bubbles_thoughts_mode ON public.bubbles_thoughts (mode);
CREATE INDEX idx_bubbles_thoughts_curated ON public.bubbles_thoughts (is_curated);

-- Function for semantic search over knowledge base
CREATE OR REPLACE FUNCTION public.search_bubbles_knowledge(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter_category public.bubbles_knowledge_category DEFAULT NULL,
  filter_mode public.bubbles_mode DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  category public.bubbles_knowledge_category,
  mode public.bubbles_mode,
  tags TEXT[],
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    bk.id,
    bk.title,
    bk.content,
    bk.category,
    bk.mode,
    bk.tags,
    bk.metadata,
    1 - (bk.embedding <=> query_embedding) AS similarity
  FROM public.bubbles_knowledge bk
  WHERE 
    bk.embedding IS NOT NULL
    AND 1 - (bk.embedding <=> query_embedding) > match_threshold
    AND (filter_category IS NULL OR bk.category = filter_category)
    AND (filter_mode IS NULL OR bk.mode = filter_mode)
  ORDER BY bk.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function for semantic search over thoughts
CREATE OR REPLACE FUNCTION public.search_bubbles_thoughts(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter_mode public.bubbles_mode DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  text TEXT,
  mode public.bubbles_mode,
  trigger_category TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    bt.id,
    bt.text,
    bt.mode,
    bt.trigger_category,
    1 - (bt.embedding <=> query_embedding) AS similarity
  FROM public.bubbles_thoughts bt
  WHERE 
    bt.embedding IS NOT NULL
    AND 1 - (bt.embedding <=> query_embedding) > match_threshold
    AND (filter_mode IS NULL OR bt.mode = filter_mode)
  ORDER BY bt.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Enable RLS on all tables (public read for knowledge, restricted write)
ALTER TABLE public.bubbles_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bubbles_thoughts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bubbles_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bubbles_triggers ENABLE ROW LEVEL SECURITY;

-- Public read access for all Bubbles knowledge (needed for storefront/AI)
CREATE POLICY "Public read access for bubbles_knowledge"
ON public.bubbles_knowledge FOR SELECT
USING (true);

CREATE POLICY "Public read access for bubbles_thoughts"
ON public.bubbles_thoughts FOR SELECT
USING (true);

CREATE POLICY "Public read access for bubbles_scenarios"
ON public.bubbles_scenarios FOR SELECT
USING (true);

CREATE POLICY "Public read access for bubbles_triggers"
ON public.bubbles_triggers FOR SELECT
USING (true);

-- Trigger to update updated_at
CREATE TRIGGER update_bubbles_knowledge_updated_at
BEFORE UPDATE ON public.bubbles_knowledge
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();