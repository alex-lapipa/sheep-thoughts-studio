-- Create table for RAG content (conspiracies & misbeliefs)
CREATE TABLE IF NOT EXISTS public.bubbles_rag_content (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('conspiracy_theme', 'conspiracy_seed', 'everyday_misbelief')),
  title TEXT NOT NULL,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  canonical_claim TEXT,
  bubbles_wrong_take TEXT NOT NULL,
  signature_lines TEXT[] DEFAULT '{}',
  comedy_hooks TEXT[] DEFAULT '{}',
  avoid TEXT[] DEFAULT '{}',
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bubbles_rag_content ENABLE ROW LEVEL SECURITY;

-- Public read policy (RAG content is public for AI to query)
CREATE POLICY "RAG content is publicly readable"
ON public.bubbles_rag_content
FOR SELECT
USING (true);

-- Admin write policy
CREATE POLICY "Admins can manage RAG content"
ON public.bubbles_rag_content
FOR ALL
USING (public.can_access_admin(auth.uid()));

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS bubbles_rag_content_embedding_idx
ON public.bubbles_rag_content
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create text search index
CREATE INDEX IF NOT EXISTS bubbles_rag_content_title_idx
ON public.bubbles_rag_content
USING gin (to_tsvector('english', title));

CREATE INDEX IF NOT EXISTS bubbles_rag_content_type_idx
ON public.bubbles_rag_content (type);

CREATE INDEX IF NOT EXISTS bubbles_rag_content_category_idx
ON public.bubbles_rag_content (category);

-- Create function to search RAG content by embedding
CREATE OR REPLACE FUNCTION public.search_bubbles_rag_content(
  query_embedding vector(1536),
  filter_type TEXT DEFAULT NULL,
  filter_category TEXT DEFAULT NULL,
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id TEXT,
  type TEXT,
  title TEXT,
  category TEXT,
  tags TEXT[],
  bubbles_wrong_take TEXT,
  signature_lines TEXT[],
  comedy_hooks TEXT[],
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.type,
    r.title,
    r.category,
    r.tags,
    r.bubbles_wrong_take,
    r.signature_lines,
    r.comedy_hooks,
    1 - (r.embedding <=> query_embedding) AS similarity
  FROM bubbles_rag_content r
  WHERE r.embedding IS NOT NULL
    AND 1 - (r.embedding <=> query_embedding) > match_threshold
    AND (filter_type IS NULL OR r.type = filter_type)
    AND (filter_category IS NULL OR r.category = filter_category)
  ORDER BY r.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;