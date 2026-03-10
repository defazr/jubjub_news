-- JubJub Headlines - Articles Table Schema
-- Run this in Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  summary text,
  excerpt text,
  source_url text NOT NULL,
  image_url text,
  publisher text,
  category text NOT NULL,
  keywords text[] DEFAULT '{}',
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  source_hash text NOT NULL
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles (slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles (category);
CREATE INDEX IF NOT EXISTS idx_articles_source_hash ON articles (source_hash);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_keywords ON articles USING GIN (keywords);

-- RLS: Enable and allow public read access
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON articles
  FOR SELECT USING (true);

CREATE POLICY "Service role insert" ON articles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role update" ON articles
  FOR UPDATE USING (true);
