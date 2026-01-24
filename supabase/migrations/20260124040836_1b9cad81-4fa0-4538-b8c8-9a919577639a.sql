-- First add a unique constraint on asset_key, then insert the archived designs
ALTER TABLE brand_assets ADD CONSTRAINT brand_assets_asset_key_unique UNIQUE (asset_key);

-- Archive legacy Bubbles designs for brand book reference
INSERT INTO brand_assets (asset_key, asset_name, asset_type, asset_value, description, is_active)
VALUES 
  ('bubbles_legacy_svg_bog', 'Bubbles Bog SVG (Legacy)', 'mascot', 
   '{"status": "archived", "component": "BubblesBog", "style": "cute_svg", "postures": ["four-legged", "seated", "grazing", "leaning"], "notes": "Original SVG mascot. Deprecated in favor of post-punk stencil style."}'::jsonb,
   'Original friendly SVG mascot - archived for brand book. DO NOT USE ON SITE.',
   false),
   
  ('bubbles_legacy_svg_mascot', 'Bubbles Mascot SVG (Legacy)', 'mascot',
   '{"status": "archived", "component": "BubblesMascot", "style": "cute_cartoon", "notes": "Alternative cartoon mascot. Deprecated in favor of post-punk stencil style."}'::jsonb,
   'Alternative cartoon mascot - archived for brand book. DO NOT USE ON SITE.',
   false),
   
  ('bubbles_legacy_herosection', 'Hero Section Face (Legacy)', 'mascot',
   '{"status": "archived", "component": "HeroSection", "style": "simple_face", "notes": "Basic geometric representation. Deprecated."}'::jsonb,
   'Simple geometric face mascot - archived for brand book. DO NOT USE ON SITE.',
   false),
   
  ('bubbles_active_stencil', 'Bubbles Stencil (Active)', 'mascot',
   '{"status": "active", "component": "BubblesHeroImage", "style": "post_punk_stencil", "source": "D&C Nineties T design", "file": "src/assets/bubbles-hero-stencil.png"}'::jsonb,
   'Active brand mascot - post-punk stencil style from T-shirt collection.',
   true);