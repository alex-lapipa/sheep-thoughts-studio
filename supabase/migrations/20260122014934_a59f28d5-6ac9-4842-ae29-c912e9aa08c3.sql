-- Add spam detection columns to contact_messages
ALTER TABLE public.contact_messages 
ADD COLUMN IF NOT EXISTS is_spam boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS spam_score numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS spam_reasons text[] DEFAULT '{}';

-- Add spam detection columns to submitted_questions
ALTER TABLE public.submitted_questions 
ADD COLUMN IF NOT EXISTS is_spam boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS spam_score numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS spam_reasons text[] DEFAULT '{}';