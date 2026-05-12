-- ============================================================
-- NinjagoBrasil — Sistema de roles (admin / mod / user)
-- ============================================================

-- Adiciona coluna role à tabela profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'mod', 'admin'));

-- Migra is_admin existente para role
UPDATE profiles SET role = 'admin' WHERE is_admin = TRUE;

-- Adiciona coluna pinned em community_posts
ALTER TABLE community_posts
  ADD COLUMN IF NOT EXISTS pinned BOOLEAN NOT NULL DEFAULT FALSE;

-- ── Atualiza policies do blog ──────────────────────────
DROP POLICY IF EXISTS "blog_admin_all" ON blog_posts;
CREATE POLICY "blog_admin_all" ON blog_posts FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ── Policies de community posts ────────────────────────
-- Mods e admins podem deletar qualquer post
DROP POLICY IF EXISTS "community_owner_delete" ON community_posts;
CREATE POLICY "community_owner_delete" ON community_posts FOR DELETE USING (
  auth.uid() = author_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('mod', 'admin'))
);

-- Mods e admins podem atualizar qualquer post (pin, etc)
DROP POLICY IF EXISTS "community_owner_update" ON community_posts;
CREATE POLICY "community_owner_update" ON community_posts FOR UPDATE USING (
  auth.uid() = author_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('mod', 'admin'))
);

-- ── Policies de comentários ────────────────────────────
DROP POLICY IF EXISTS "comments_owner_delete" ON comments;
CREATE POLICY "comments_owner_delete" ON comments FOR DELETE USING (
  auth.uid() = author_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('mod', 'admin'))
);

-- ── Policies de chat ───────────────────────────────────
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS deleted BOOLEAN NOT NULL DEFAULT FALSE;

DROP POLICY IF EXISTS "chat_mod_delete" ON chat_messages;
CREATE POLICY "chat_mod_delete" ON chat_messages FOR DELETE USING (
  auth.uid() = author_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('mod', 'admin'))
);

-- ── Função helper: promover usuário ───────────────────
CREATE OR REPLACE FUNCTION set_user_role(target_user_id UUID, new_role TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Apenas administradores podem alterar roles.';
  END IF;
  UPDATE profiles SET role = new_role WHERE id = target_user_id;
END;
$$;

-- ── Policy: apenas admins podem alterar roles ──────────
DROP POLICY IF EXISTS "profiles_admin_update" ON profiles;
CREATE POLICY "profiles_admin_update" ON profiles FOR UPDATE USING (
  auth.uid() = id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
