-- Create search function for bubbles_triggers
CREATE OR REPLACE FUNCTION public.search_bubbles_triggers(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10,
  filter_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  category TEXT,
  description TEXT,
  internal_logic TEXT,
  example_scenario TEXT,
  example_bubbles TEXT[],
  tags TEXT[],
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.name,
    t.category,
    t.description,
    t.internal_logic,
    t.example_scenario,
    t.example_bubbles,
    t.tags,
    1 - (t.embedding <=> query_embedding) AS similarity
  FROM public.bubbles_triggers t
  WHERE 
    t.embedding IS NOT NULL
    AND 1 - (t.embedding <=> query_embedding) > match_threshold
    AND (filter_category IS NULL OR t.category = filter_category)
  ORDER BY t.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;