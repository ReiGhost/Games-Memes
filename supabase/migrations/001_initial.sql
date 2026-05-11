-- ============================================================
-- NinjagoBrasil - Schema inicial
-- ============================================================

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     TEXT UNIQUE NOT NULL,
  avatar_url   TEXT,
  bio          TEXT,
  ninja_rank   TEXT NOT NULL DEFAULT 'Estudante',
  is_admin     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_public_read"  ON profiles FOR SELECT USING (TRUE);
CREATE POLICY "profiles_owner_write"  ON profiles FOR ALL   USING (auth.uid() = id);

-- BLOG POSTS
CREATE TABLE IF NOT EXISTS blog_posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  excerpt      TEXT,
  content      TEXT NOT NULL,
  cover_image  TEXT,
  tags         TEXT[] DEFAULT '{}',
  published    BOOLEAN NOT NULL DEFAULT FALSE,
  views        INTEGER NOT NULL DEFAULT 0,
  author_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blog_public_read"    ON blog_posts FOR SELECT USING (published = TRUE);
CREATE POLICY "blog_admin_all"      ON blog_posts FOR ALL   USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- COMMUNITY POSTS
CREATE TABLE IF NOT EXISTS community_posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  content      TEXT,
  image_url    TEXT,
  flair        TEXT DEFAULT 'Geral',
  author_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score        INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "community_public_read"   ON community_posts FOR SELECT USING (TRUE);
CREATE POLICY "community_auth_insert"   ON community_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "community_owner_update"  ON community_posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "community_owner_delete"  ON community_posts FOR DELETE USING (auth.uid() = author_id);

-- VOTES
CREATE TABLE IF NOT EXISTS votes (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id   UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  value     SMALLINT NOT NULL CHECK (value IN (-1, 1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, user_id)
);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "votes_public_read"   ON votes FOR SELECT USING (TRUE);
CREATE POLICY "votes_auth_write"    ON votes FOR ALL   USING (auth.uid() = user_id);

-- COMMENTS
CREATE TABLE IF NOT EXISTS comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content     TEXT NOT NULL,
  author_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id     UUID NOT NULL,
  post_type   TEXT NOT NULL CHECK (post_type IN ('blog', 'community')),
  parent_id   UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments_public_read"   ON comments FOR SELECT USING (TRUE);
CREATE POLICY "comments_auth_insert"   ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "comments_owner_update"  ON comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "comments_owner_delete"  ON comments FOR DELETE USING (auth.uid() = author_id);

-- CHAT MESSAGES
CREATE TABLE IF NOT EXISTS chat_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content    TEXT NOT NULL,
  author_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  room       TEXT NOT NULL DEFAULT 'geral',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chat_public_read"   ON chat_messages FOR SELECT USING (TRUE);
CREATE POLICY "chat_auth_insert"   ON chat_messages FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- FUNCTION: auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, username, ninja_rank)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    'Estudante'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- SEED: demo blog posts
INSERT INTO blog_posts (title, slug, excerpt, content, tags, published, author_id)
SELECT
  'Bem-vindo ao NinjagoBrasil!',
  'bem-vindo-ninjago-brasil',
  'A maior comunidade brasileira de Ninjago chegou. Conheça tudo que preparamos para vocês.',
  E'# Bem-vindo ao NinjagoBrasil!\n\nOlá, ninjas! Sou o **ReiBricks** e é com muito orgulho que apresento o **NinjagoBrasil** — o lar da comunidade brasileira de fãs de Ninjago.\n\n## O que você encontra aqui\n\n- **Blog**: Notícias, reviews de sets, tutoriais de MOC e muito mais\n- **Comunidade**: Compartilhe suas criações, discussões e coleções\n- **Chat**: Converse em tempo real com outros ninjas\n\n## Canal no YouTube\n\nNão esqueça de se inscrever no canal [@rei_bricks](https://youtube.com/@rei_bricks) para mais conteúdo!\n\nNinja go! 🥷',
  ARRAY['boas-vindas', 'notícia'],
  TRUE,
  p.id
FROM profiles p
WHERE p.is_admin = TRUE
LIMIT 1;
