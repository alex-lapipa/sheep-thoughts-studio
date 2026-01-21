-- Brand Assets table for versioned brand guidelines
CREATE TABLE public.brand_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_type TEXT NOT NULL, -- 'color', 'typography', 'character', 'production', 'guideline'
  asset_key TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  asset_value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(asset_type, asset_key, version)
);

-- Enable RLS
ALTER TABLE public.brand_assets ENABLE ROW LEVEL SECURITY;

-- Anyone can read brand assets (for storefront consistency)
CREATE POLICY "Brand assets are viewable by everyone"
ON public.brand_assets
FOR SELECT
USING (true);

-- Only admins and merch users can modify
CREATE POLICY "Admins and merch can manage brand assets"
ON public.brand_assets
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::public.user_role) OR public.has_role(auth.uid(), 'merch'::public.user_role));

-- Add trigger for updated_at
CREATE TRIGGER update_brand_assets_updated_at
BEFORE UPDATE ON public.brand_assets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial brand colors based on research
INSERT INTO public.brand_assets (asset_type, asset_key, asset_name, asset_value, description) VALUES
-- Primary Palette (Wicklow-grounded)
('color', 'bog-cotton-cream', 'Bog Cotton Cream', '{"hex": "#FFFDD0", "hsl": "55 100% 91%", "rgb": "255, 253, 208", "pantone": "P 1-1 C", "role": "primary", "category": "wicklow"}', 'Primary fleece color - Wicklow sheep fleece, innocence'),
('color', 'gorse-gold', 'Gorse Gold', '{"hex": "#E8B923", "hsl": "45 82% 53%", "rgb": "232, 185, 35", "pantone": "7405 C", "role": "secondary-warm", "category": "wicklow"}', 'Secondary warm - Wicklow gorse, comedy psychology'),
('color', 'mountain-mist', 'Mountain Mist', '{"hex": "#B0C4DE", "hsl": "214 41% 78%", "rgb": "176, 196, 222", "pantone": "644 C", "role": "secondary-cool", "category": "wicklow"}', 'Secondary cool - Wicklow atmosphere, calm'),
('color', 'heather-mauve', 'Heather Mauve', '{"hex": "#8B668B", "hsl": "300 15% 47%", "rgb": "139, 102, 139", "pantone": "2069 C", "role": "accent", "category": "wicklow"}', 'Accent - Wicklow heather, sophistication'),
('color', 'peat-earth', 'Peat Earth', '{"hex": "#2C2C2C", "hsl": "0 0% 17%", "rgb": "44, 44, 44", "pantone": "Black 6 C", "role": "dark-neutral", "category": "wicklow"}', 'Dark neutral - Wicklow bog, edge anchor'),

-- Mode Accents
('color', 'mode-innocent', 'Soft Blush', '{"hex": "#FFB6C1", "hsl": "351 100% 86%", "rgb": "255, 182, 193", "pantone": "182 C", "mode": "innocent", "category": "mode"}', 'Innocent mode - Default calm, rounded relaxed'),
('color', 'mode-concerned', 'Misty Blue', '{"hex": "#B0C4DE", "hsl": "214 41% 78%", "rgb": "176, 196, 222", "pantone": "644 C", "mode": "concerned", "category": "mode"}', 'Concerned mode - Mild worry, slightly tense curves'),
('color', 'mode-triggered', 'Bracken Copper', '{"hex": "#B87333", "hsl": "27 56% 46%", "rgb": "184, 115, 51", "pantone": "7571 C", "mode": "triggered", "category": "mode"}', 'Triggered mode - Rising irritation, angular elements'),
('color', 'mode-savage', 'Hot Pink', '{"hex": "#FF69B4", "hsl": "330 100% 71%", "rgb": "255, 105, 180", "pantone": "212 C", "mode": "savage", "category": "mode"}', 'Savage mode - Full sass, sharp angles narrow eyes'),
('color', 'mode-nuclear', 'Acid Yellow', '{"hex": "#DFFF00", "hsl": "68 100% 50%", "rgb": "223, 255, 0", "pantone": "396 C", "mode": "nuclear", "category": "mode"}', 'Nuclear mode - Maximum chaos, spiky explosive forms'),

-- Seasonal Palettes
('color', 'spring-green', 'Fresh Emerald', '{"hex": "#50C878", "hsl": "140 51% 55%", "rgb": "80, 200, 120", "season": "spring", "category": "seasonal"}', 'Spring drop - Fresh greens'),
('color', 'autumn-rust', 'Bracken Rust', '{"hex": "#8B4513", "hsl": "25 75% 31%", "rgb": "139, 69, 19", "season": "autumn", "category": "seasonal"}', 'Autumn drop - Bracken copper/rust'),
('color', 'winter-bronze', 'Heather Bronze', '{"hex": "#5D4E37", "hsl": "32 27% 29%", "rgb": "93, 78, 55", "season": "winter", "category": "seasonal"}', 'Winter drop - Heather bronze, tobacco tones'),

-- Typography
('typography', 'display-innocent', 'Display Innocent', '{"family": "Space Grotesk", "weight": "500", "spacing": "0.02em", "style": "rounded, bouncy", "usage": "innocent mode headers"}', 'Rounded sans-serif with bouncy character, wide spacing'),
('typography', 'display-savage', 'Display Savage', '{"family": "Space Grotesk", "weight": "700", "spacing": "-0.01em", "style": "angular, tight", "usage": "savage mode headers"}', 'Angular display face with tighter spacing, sharper terminals'),
('typography', 'body', 'Body Text', '{"family": "Inter", "weight": "400", "spacing": "0", "style": "clean, readable", "usage": "body copy"}', 'Clean sans-serif for readability'),

-- Character Shape Grammar
('character', 'default-bubbles', 'Default Bubbles', '{"curves": "80%", "organic": "20%", "eyes": "large, round", "wool": "cloud-like puffs", "posture": "bouncy", "mouth": "small, curved"}', 'Default innocent mode - 80% curves, 20% soft organic shapes'),
('character', 'mode-shift-eyes', 'Mode Shift: Eyes', '{"innocent": "large, round", "concerned": "slightly narrowed", "triggered": "narrow with corners", "savage": "sharp corners, narrow", "nuclear": "intense slits"}', 'Eyes narrow and gain angular corners as mode intensifies'),
('character', 'mode-shift-wool', 'Mode Shift: Wool', '{"innocent": "cloud-like, fluffy", "concerned": "slightly disheveled", "triggered": "spiky tufts emerging", "savage": "definitely spiky", "nuclear": "explosive, chaotic"}', 'Wool tufts become spikier as mode intensifies'),
('character', 'wool-thought-bubble', 'Wool as Thought Bubble', '{"concept": "Bubbles wool transforms into thought bubble shapes", "chains": "smaller puffs connecting to message", "recognition": "iconic brand element"}', 'Bubbles wool can literally be the thought bubble'),

-- Production Specs
('production', 'screen-printing', 'Screen Printing', '{"max_colors": 4, "optimal_colors": "2-3", "halftone_lpi": "35-45", "mesh_multiplier": 5, "angle": "22.5-25°", "notes": "Provide light and dark garment variants"}', 'Screen printing specs - 2-4 color versions'),
('production', 'embroidery', 'Embroidery', '{"max_colors": 6, "optimal_colors": "4-6", "min_line_width": "1mm", "min_text_height": "8mm", "notes": "Strong value contrast between adjacent colors"}', 'Embroidery specs - no fine gradients'),
('production', 'wcag-contrast', 'WCAG Contrast', '{"normal_text_aa": "4.5:1", "normal_text_aaa": "7:1", "large_text_aa": "3:1", "large_text_aaa": "4.5:1", "ui_components": "3:1"}', 'WCAG accessibility minimum contrast ratios');
