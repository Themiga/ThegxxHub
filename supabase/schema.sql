-- ============================================================
-- ROBLOX SCRIPTS HUB - Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT,
  banned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- POSTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  script_content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  category TEXT NOT NULL DEFAULT 'general',
  game_name TEXT,
  game_link TEXT,
  source TEXT NOT NULL DEFAULT 'Terceiros' CHECK (source IN ('ThegxxHub', 'Terceiros')),
  has_key BOOLEAN NOT NULL DEFAULT FALSE,
  is_paid BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'privado', 'rascunho', 'arquivado')),
  script_version TEXT DEFAULT '1.0',
  thumbnail_url TEXT,
  highlight_color TEXT DEFAULT '#e60000',
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure new columns exist on the posts table (idempotent - safe for new and existing databases)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS game_name TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS game_link TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'Terceiros';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS has_key BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_paid BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ativo';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS script_version TEXT DEFAULT '1.0';

-- Add CHECK constraints if they don't exist (PostgreSQL 12+)
DO $$ BEGIN
  BEGIN
    ALTER TABLE posts ADD CONSTRAINT posts_source_check CHECK (source IN ('ThegxxHub', 'Terceiros'));
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER TABLE posts ADD CONSTRAINT posts_status_check CHECK (status IN ('ativo', 'privado', 'rascunho', 'arquivado'));
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- ============================================================
-- LIKES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'dislike')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- ============================================================
-- RATINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- ============================================================
-- EXECUTORS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS executors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT '',
  price TEXT NOT NULL DEFAULT 'Gratuito',
  description TEXT NOT NULL DEFAULT '',
  level TEXT NOT NULL DEFAULT 'Iniciante' CHECK (level IN ('Iniciante', 'Intermediario', 'Avancado')),
  level_color TEXT NOT NULL DEFAULT '#22c55e',
  tags TEXT[] DEFAULT '{}',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- VIEWS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE UNIQUE,
  count INTEGER NOT NULL DEFAULT 0
);

-- ============================================================
-- FUNCTION: auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION generate_unique_username(base_username TEXT)
RETURNS TEXT AS $$
DECLARE
  clean_base TEXT;
  candidate TEXT;
  suffix INTEGER := 0;
BEGIN
  clean_base := lower(regexp_replace(COALESCE(NULLIF(trim(base_username), ''), 'user'), '[^a-zA-Z0-9_-]', '', 'g'));

  IF clean_base = '' THEN
    clean_base := 'user';
  END IF;

  clean_base := left(clean_base, 30);
  candidate := clean_base;

  LOOP
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE username = candidate
    );

    suffix := suffix + 1;
    candidate := left(clean_base, 30 - length(suffix::text)) || suffix::text;
  END LOOP;

  RETURN candidate;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  requested_username TEXT;
BEGIN
  requested_username := COALESCE(
    NULLIF(trim(NEW.raw_user_meta_data->>'username'), ''),
    split_part(NEW.email, '@', 1),
    'user'
  );

  INSERT INTO public.profiles (id, username, role)
  VALUES (
    NEW.id,
    public.generate_unique_username(requested_username),
    'user'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- FUNCTION: auto-initialize view counter on post insert
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_post()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.views (post_id, count) VALUES (NEW.id, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_post_created ON posts;
CREATE TRIGGER on_post_created
  AFTER INSERT ON posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_post();

-- ============================================================
-- FUNCTION: update updated_at on post update
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS posts_updated_at ON posts;
CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE views ENABLE ROW LEVEL SECURITY;
ALTER TABLE executors ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- POSTS POLICIES
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON posts;
CREATE POLICY "Posts are viewable by everyone"
  ON posts FOR SELECT USING (
    status = 'ativo' OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Only admins can insert posts" ON posts;
CREATE POLICY "Only admins can insert posts"
  ON posts FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Only admins can update posts" ON posts;
CREATE POLICY "Only admins can update posts"
  ON posts FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Only admins can delete posts" ON posts;
CREATE POLICY "Only admins can delete posts"
  ON posts FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- LIKES POLICIES
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON likes;
CREATE POLICY "Likes are viewable by everyone"
  ON likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert likes" ON likes;
CREATE POLICY "Authenticated users can insert likes"
  ON likes FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND auth.uid() = user_id AND
    NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND banned = TRUE)
  );

DROP POLICY IF EXISTS "Users can update their own likes" ON likes;
CREATE POLICY "Users can update their own likes"
  ON likes FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own likes" ON likes;
CREATE POLICY "Users can delete their own likes"
  ON likes FOR DELETE USING (auth.uid() = user_id);

-- RATINGS POLICIES
DROP POLICY IF EXISTS "Ratings are viewable by everyone" ON ratings;
CREATE POLICY "Ratings are viewable by everyone"
  ON ratings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert ratings" ON ratings;
CREATE POLICY "Authenticated users can insert ratings"
  ON ratings FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND auth.uid() = user_id AND
    NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND banned = TRUE)
  );

DROP POLICY IF EXISTS "Users can update their own ratings" ON ratings;
CREATE POLICY "Users can update their own ratings"
  ON ratings FOR UPDATE USING (auth.uid() = user_id);

-- VIEWS POLICIES
DROP POLICY IF EXISTS "Views are viewable by everyone" ON views;
CREATE POLICY "Views are viewable by everyone"
  ON views FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role can update views" ON views;
CREATE POLICY "Service role can update views"
  ON views FOR UPDATE USING (true);

-- EXECUTORS POLICIES
DROP POLICY IF EXISTS "Executors are viewable by everyone" ON executors;
CREATE POLICY "Executors are viewable by everyone"
  ON executors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can insert executors" ON executors;
CREATE POLICY "Only admins can insert executors"
  ON executors FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Only admins can update executors" ON executors;
CREATE POLICY "Only admins can update executors"
  ON executors FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Only admins can delete executors" ON executors;
CREATE POLICY "Only admins can delete executors"
  ON executors FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- STORAGE BUCKET for thumbnails
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Thumbnails are publicly accessible" ON storage.objects;
CREATE POLICY "Thumbnails are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'thumbnails');

DROP POLICY IF EXISTS "Admins can upload thumbnails" ON storage.objects;
CREATE POLICY "Admins can upload thumbnails"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'thumbnails' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can delete thumbnails" ON storage.objects;
CREATE POLICY "Admins can delete thumbnails"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'thumbnails' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- HOW TO MAKE SOMEONE ADMIN
-- Run this in Supabase SQL editor, replacing with their username:
--   UPDATE public.profiles SET role = 'admin' WHERE username = 'nome_do_usuario';
-- ============================================================
