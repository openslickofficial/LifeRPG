-- Life RPG: Sample Shop Items Seed Data
-- 5 Starter items: themes, badges, and cosmetics for the in-game shop

INSERT INTO public.shop_items (id, name, description, price, type)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'Cyberpunk Neon Theme',
    'Transforms your HUD with high-contrast glowing neon cyan and magenta accents for high-energy focus.',
    250,
    'theme'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'Midnight Obsidian Theme',
    'Deep OLED-black aesthetics with subtle luminescent borders engineered for nocturnal focus sprints.',
    300,
    'theme'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'Grandmaster Paladin Badge',
    'A prestigious golden emblem displayed on your character sheet signifying relentless daily discipline.',
    500,
    'badge'
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'Aura of Deep Work',
    'A radiant arcane particle glow surrounding your character avatar during uninterrupted work sessions.',
    400,
    'cosmetic'
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    'Arcane Focus Banner',
    'An illustrated profile header banner infused with focus runes and glowing guild insignia.',
    150,
    'cosmetic'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  type = EXCLUDED.type;
