-- Create conversation history table for voice chat persistence
CREATE TABLE public.voice_chat_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL DEFAULT gen_random_uuid(),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  mode TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.voice_chat_history ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for anonymous users (no auth required for chat)
CREATE POLICY "Anyone can read voice chat history"
  ON public.voice_chat_history
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert voice chat history"
  ON public.voice_chat_history
  FOR INSERT
  WITH CHECK (true);

-- Index for faster session lookups
CREATE INDEX idx_voice_chat_history_session ON public.voice_chat_history(session_id);
CREATE INDEX idx_voice_chat_history_created ON public.voice_chat_history(created_at DESC);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.voice_chat_history;