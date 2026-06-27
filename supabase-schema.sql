-- ============================================================
-- BeachMap — Schema Supabase
-- Rulează asta în Supabase → SQL Editor → New Query
-- ============================================================

-- 1. Regiuni mondiale (Europa, Asia, Africa, etc.)
CREATE TABLE world_regions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  emoji       text NOT NULL DEFAULT '🌍',
  sort_order  int  NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

-- 2. Țări
CREATE TABLE countries (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  world_region_id  uuid NOT NULL REFERENCES world_regions(id) ON DELETE CASCADE,
  name             text NOT NULL,
  slug             text NOT NULL UNIQUE,
  flag_emoji       text NOT NULL DEFAULT '🏳️',
  description      text,
  cover_image_url  text,
  created_at       timestamptz DEFAULT now()
);

-- 3. Regiuni din țară (județe, provincii, etc.)
CREATE TABLE regions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id   uuid NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  name         text NOT NULL,
  slug         text NOT NULL,
  description  text,
  created_at   timestamptz DEFAULT now(),
  UNIQUE(country_id, slug)
);

-- 4. Orașe / stațiuni
CREATE TABLE cities (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id        uuid NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  country_id       uuid NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  name             text NOT NULL,
  slug             text NOT NULL,
  latitude         float8 NOT NULL,
  longitude        float8 NOT NULL,
  description      text,
  cover_image_url  text,
  created_at       timestamptz DEFAULT now(),
  UNIQUE(country_id, slug)
);

-- 5. Plaje
CREATE TABLE beaches (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id          uuid NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  name             text NOT NULL,
  slug             text NOT NULL,
  latitude         float8 NOT NULL,
  longitude        float8 NOT NULL,
  blue_flag        boolean NOT NULL DEFAULT false,
  blue_flag_year   int,
  description      text,
  cover_image_url  text,
  facilities       text[] DEFAULT '{}',
  water_quality    text CHECK (water_quality IN ('excellent','good','fair','poor')),
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now(),
  UNIQUE(city_id, slug)
);

-- ============================================================
-- Indecși pentru performanță
-- ============================================================
CREATE INDEX idx_countries_world_region ON countries(world_region_id);
CREATE INDEX idx_regions_country        ON regions(country_id);
CREATE INDEX idx_cities_region          ON cities(region_id);
CREATE INDEX idx_cities_country         ON cities(country_id);
CREATE INDEX idx_beaches_city           ON beaches(city_id);
CREATE INDEX idx_beaches_blue_flag      ON beaches(blue_flag);

-- ============================================================
-- RLS (Row Level Security) — doar tu poți edita
-- ============================================================
ALTER TABLE world_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries     ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities        ENABLE ROW LEVEL SECURITY;
ALTER TABLE beaches       ENABLE ROW LEVEL SECURITY;

-- Toată lumea poate citi (site public)
CREATE POLICY "public read world_regions" ON world_regions FOR SELECT USING (true);
CREATE POLICY "public read countries"     ON countries     FOR SELECT USING (true);
CREATE POLICY "public read regions"       ON regions       FOR SELECT USING (true);
CREATE POLICY "public read cities"        ON cities        FOR SELECT USING (true);
CREATE POLICY "public read beaches"       ON beaches       FOR SELECT USING (true);

-- Doar utilizatorul autentificat (tu) poate scrie
CREATE POLICY "admin insert world_regions" ON world_regions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "admin update world_regions" ON world_regions FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "admin delete world_regions" ON world_regions FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "admin insert countries" ON countries FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "admin update countries" ON countries FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "admin delete countries" ON countries FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "admin insert regions" ON regions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "admin update regions" ON regions FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "admin delete regions" ON regions FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "admin insert cities" ON cities FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "admin update cities" ON cities FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "admin delete cities" ON cities FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "admin insert beaches" ON beaches FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "admin update beaches" ON beaches FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "admin delete beaches" ON beaches FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- Date de test — România pentru început
-- ============================================================
INSERT INTO world_regions (name, slug, emoji, sort_order) VALUES
  ('Europa',  'europa',   '🇪🇺', 1),
  ('Asia',    'asia',     '🌏', 2),
  ('Africa',  'africa',   '🌍', 3),
  ('America', 'america',  '🌎', 4),
  ('Oceania', 'oceania',  '🌊', 5);

INSERT INTO countries (world_region_id, name, slug, flag_emoji, description)
VALUES (
  (SELECT id FROM world_regions WHERE slug = 'europa'),
  'România', 'romania', '🇷🇴',
  'Țara cu cel mai lung litoral la Marea Neagră din UE, cu plaje întinse și stațiuni vibrante.'
);

INSERT INTO regions (country_id, name, slug, description)
VALUES (
  (SELECT id FROM countries WHERE slug = 'romania'),
  'Dobrogea', 'dobrogea',
  'Singura regiune a României cu ieșire la Marea Neagră. Include litoralul și Delta Dunării.'
);

INSERT INTO cities (region_id, country_id, name, slug, latitude, longitude, description)
VALUES
  ((SELECT id FROM regions WHERE slug = 'dobrogea'), (SELECT id FROM countries WHERE slug = 'romania'),
   'Mamaia',      'mamaia',      44.2536, 28.6386, 'Cea mai populară stațiune de pe litoralul românesc.'),
  ((SELECT id FROM regions WHERE slug = 'dobrogea'), (SELECT id FROM countries WHERE slug = 'romania'),
   'Constanța',   'constanta',   44.1733, 28.6383, 'Cel mai mare port la Marea Neagră și cel mai vechi oraș din România.'),
  ((SELECT id FROM regions WHERE slug = 'dobrogea'), (SELECT id FROM countries WHERE slug = 'romania'),
   'Eforie Nord', 'eforie-nord', 44.0614, 28.6336, 'Stațiune liniștită cu plaje curate și lacul Techirghiol alături.'),
  ((SELECT id FROM regions WHERE slug = 'dobrogea'), (SELECT id FROM countries WHERE slug = 'romania'),
   'Vama Veche',  'vama-veche',  43.7464, 28.5839, 'Ultima localitate de pe litoral înainte de granița cu Bulgaria, spirit liber.');

INSERT INTO beaches (city_id, name, slug, latitude, longitude, blue_flag, blue_flag_year, description, facilities, water_quality)
VALUES
  ((SELECT id FROM cities WHERE slug = 'mamaia'),
   'Plaja Mamaia Nord', 'mamaia-nord', 44.2700, 28.6400, true, 2024,
   'Plajă lată și curată, cu nisip fin, Blue Flag din 2019.',
   ARRAY['dusuri','vestiare','salvamar','umbrele','sezlonguri'], 'excellent'),

  ((SELECT id FROM cities WHERE slug = 'constanta'),
   'Plaja Modern', 'modern', 44.1600, 28.6500, true, 2024,
   'Plajă urbană reamenajată, în apropierea Cazinoului din Constanța.',
   ARRAY['dusuri','vestiare','salvamar','restaurant'], 'good'),

  ((SELECT id FROM cities WHERE slug = 'eforie-nord'),
   'Plaja Eforie Nord Central', 'eforie-nord-central', 44.0600, 28.6350, true, 2024,
   'Plajă liniștită, ideală pentru familii.',
   ARRAY['dusuri','vestiare','salvamar','umbrele','sezlonguri','locuri-de-joaca'], 'excellent'),

  ((SELECT id FROM cities WHERE slug = 'vama-veche'),
   'Plaja Vama Veche', 'vama-veche-beach', 43.7460, 28.5840, false, null,
   'Plajă sălbatică și relaxată, fără amenajări excesive — spiritul liber al litoralului.',
   ARRAY['bar'], 'good');
