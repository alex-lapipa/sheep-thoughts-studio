-- Archive old sheep designs before replacement
INSERT INTO brand_assets (asset_key, asset_name, asset_type, asset_value, description, is_active)
VALUES 
  ('legacy_stencil_v1', 'Legacy Stencil V1', 'archived_mascot', 
   '{"source": "dazed-bubbles-tee extraction attempt", "archived_at": "2026-01-24", "reason": "replaced with user-provided exact stencil"}'::jsonb,
   'Previous stencil extraction - archived', false),
  ('legacy_stencil_v2', 'Legacy Stencil V2', 'archived_mascot',
   '{"source": "ai-generated extraction", "archived_at": "2026-01-24", "reason": "replaced with user-provided exact stencil"}'::jsonb,
   'Second extraction attempt - archived', false)
ON CONFLICT (asset_key) DO UPDATE SET
  asset_value = EXCLUDED.asset_value,
  is_active = false,
  updated_at = now();

-- Update the active stencil record
UPDATE brand_assets 
SET asset_value = '{"source": "user-uploaded sheep_stencil_exact.png", "style": "quadrupedal profile facing right", "updated_at": "2026-01-24"}'::jsonb,
    description = 'Official Bubbles stencil - user-provided exact design',
    updated_at = now()
WHERE asset_key = 'bubbles_stencil_current';