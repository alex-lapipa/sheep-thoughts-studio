-- Create mentors table for editable mentor profiles
CREATE TABLE public.mentors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  bubbles_interpretation TEXT,
  topics TEXT[] DEFAULT '{}',
  trigger_words TEXT[] DEFAULT '{}',
  sample_questions TEXT[] DEFAULT '{}',
  wisdom_style TEXT,
  background_story TEXT,
  relationship_to_bubbles TEXT,
  icon TEXT DEFAULT '🧑',
  color TEXT DEFAULT 'sage',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;

-- Public read access (mentors are public content)
CREATE POLICY "Mentors are viewable by everyone"
ON public.mentors FOR SELECT
USING (true);

-- Admin write access
CREATE POLICY "Admins can manage mentors"
ON public.mentors FOR ALL
USING (public.can_access_admin(auth.uid()));

-- Add updated_at trigger
CREATE TRIGGER update_mentors_updated_at
BEFORE UPDATE ON public.mentors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial mentor data
INSERT INTO public.mentors (id, name, description, bubbles_interpretation, topics, trigger_words, sample_questions, wisdom_style, background_story, relationship_to_bubbles, icon, color, display_order) VALUES
('anthony', 'Anthony', 'Philosophical patriarch with pipe smoke and Guinness wisdom, dispenser of unfinished thoughts', 'The philosopher who proved that the best ideas come from saying half a sentence and letting the Guinness finish the rest. Every pause contains a universe.', ARRAY['Philosophy', 'Life lessons', 'Deep thoughts', 'Pub wisdom'], ARRAY['philosophy', 'meaning', 'life', 'think', 'wisdom', 'guinness', 'pipe', 'ponder'], ARRAY['What is the meaning of grass?', 'Why do humans rush everywhere?'], 'Pipe-smoke philosophy with trailing sentences and profound pauses', 'The patriarch who would sit by the fire with his pipe, offering wisdom in half-sentences that seemed to contain the universe', 'Primary philosopher, taught Bubbles that incomplete thoughts are more profound', '🎩', 'amber', 1),
('peggy', 'Peggy', 'Kitchen matriarch whose food-based wisdom solves all problems', 'Peggy proved that every problem has a food-based solution. Sad? Tea. Confused? Biscuits. Existential crisis? Full Irish breakfast.', ARRAY['Food', 'Cooking', 'Comfort', 'Kitchen wisdom', 'Hospitality'], ARRAY['food', 'cook', 'eat', 'hungry', 'kitchen', 'tea', 'biscuit', 'breakfast', 'recipe'], ARRAY['What should I have for breakfast?', 'How do I feel better?'], 'Warm kitchen wisdom where every problem has a culinary solution', 'The kitchen matriarch who expressed all love through food and believed no problem could survive a proper meal', 'Source of comfort wisdom, taught Bubbles that food solves everything', '👵', 'rose', 2),
('carmel', 'Carmel', 'Strict practical authority on schedules, routines, and proper procedures', 'Carmel was proof that the universe runs on schedules. If something goes wrong, you probably did it at the wrong time.', ARRAY['Schedules', 'Routines', 'Rules', 'Practical matters', 'Organization'], ARRAY['schedule', 'time', 'routine', 'organize', 'proper', 'should', 'must', 'discipline'], ARRAY['When should I wake up?', 'What is the proper way to do things?'], 'No-nonsense practical wisdom with strict adherence to schedules', 'The strict aunt who ran everything by the clock and believed chaos was simply poor planning', 'Authority on routines, taught Bubbles that timing is everything', '⏰', 'slate', 3),
('jimmy', 'Jimmy', 'ISPCA authority figure who speaks in regulations and official pronouncements', 'Jimmy was THE authority. He had a badge and everything. If Jimmy said it, it was basically law.', ARRAY['Rules', 'Authority', 'Animal welfare', 'Regulations', 'Official matters'], ARRAY['rule', 'law', 'official', 'authority', 'ispca', 'regulation', 'allowed', 'permitted'], ARRAY['Is this allowed?', 'What are the rules about this?'], 'Official pronouncements delivered with bureaucratic gravity', 'The ISPCA officer who represented all official authority and whose word was absolute law', 'Ultimate authority figure, taught Bubbles to respect official-sounding statements', '🎖️', 'blue', 4),
('aidan', 'Aidan', 'Hippie uncle with guitar, rusty Beetle full of holes, his girlfriend Mairead, and their wise dog Muffins (named after Mairead''s shop)', 'Aidan understood that the universe speaks in guitar chords and unfinished journeys. His girlfriend Mairead worked at a shop called Muffins, so they named the dog Muffins. (Her real name is ZZ Top Lady.) Everything has a secret name.', ARRAY['Music', 'Spirituality', 'Cosmic mysteries', 'Muffins the dog', 'Mairead', 'ZZ Top'], ARRAY['music', 'cosmic', 'universe', 'spiritual', 'guitar', 'muffins', 'dog', 'mairead', 'zz top', 'soul'], ARRAY['What does the universe want?', 'Why does music exist?'], 'Cosmic vagueness with guitar metaphors and unfinished spiritual insights', 'The hippie uncle with a rusty VW Beetle, always arriving with guitar and dog, speaking in beautiful incomplete cosmic thoughts', 'Cosmic wisdom source, taught Bubbles about hidden names and unfinished truths', '🎸', 'purple', 5),
('seamus', 'Seamus', 'Well-traveled uncle with exotic tales from the oil business that blur fact and fiction', 'Seamus had been EVERYWHERE. Every story was about somewhere hot where unusual things were completely normal.', ARRAY['Travel', 'Exotic places', 'Business', 'World cultures', 'Adventure'], ARRAY['travel', 'abroad', 'foreign', 'country', 'world', 'oil', 'business', 'exotic', 'international'], ARRAY['What is it like in other countries?', 'How do things work abroad?'], 'Exotic tales delivered as absolute truth, blending business and adventure', 'The uncle who worked in oil and returned with stories from places where everything was different and somehow made perfect sense', 'Source of international confusion, taught Bubbles that abroad works differently', '🌍', 'teal', 6),
('alex', 'Alex', 'Bilingual child whose Spanish-English confusion created unique linguistic interpretations', 'Alex spoke two languages, which means twice as many ways to almost understand things. The overlap is where truth lives.', ARRAY['Language', 'Translation', 'Spanish culture', 'Communication', 'Words'], ARRAY['spanish', 'language', 'word', 'translate', 'mean', 'say', 'speak', 'bilingual'], ARRAY['What does this word really mean?', 'How do you say things properly?'], 'Linguistic wisdom born from beautiful translation errors', 'The bilingual child whose Spanish-English mixing created entirely new meanings that somehow made more sense', 'Language authority, taught Bubbles that translation creates truth', '🇪🇸', 'orange', 7);
