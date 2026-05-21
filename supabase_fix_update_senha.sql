-- ══════════════════════════════════════════════════════════════════════
--  RVS ESCOLAR — FIX: Atualização de Senha pelo Admin
--  PROBLEMA: Trocar senha no sistema não funciona no login
--  CAUSA:    O sistema só atualiza public.usuarios.senha (texto simples)
--            mas NÃO atualiza auth.users.encrypted_password
--  Execute no Supabase: SQL Editor → Cole tudo → Run
-- ══════════════════════════════════════════════════════════════════════

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--  Garante extensão de criptografia disponível
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--  RPC: admin_atualizar_senha
--  Atualiza SIMULTANEAMENTE:
--    1. auth.users.encrypted_password  (campo real de autenticação)
--    2. public.usuarios.senha          (campo de referência)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION public.admin_atualizar_senha(
  p_user_id UUID,
  p_nova_senha TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  encrypted_pw TEXT;
BEGIN
  -- Validação mínima
  IF p_nova_senha IS NULL OR length(p_nova_senha) < 6 THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Senha deve ter ao menos 6 caracteres.');
  END IF;

  -- Criptografa com bcrypt (mesmo algoritmo do Supabase Auth)
  encrypted_pw := crypt(p_nova_senha, gen_salt('bf'));

  -- 1. Atualiza a senha real no Supabase Auth
  UPDATE auth.users
  SET 
    encrypted_password = encrypted_pw,
    updated_at = NOW()
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Usuário não encontrado no Auth.');
  END IF;

  -- 2. Atualiza também na tabela pública (referência)
  UPDATE public.usuarios
  SET senha = p_nova_senha
  WHERE id = p_user_id;

  RETURN jsonb_build_object('status', 'success', 'message', 'Senha atualizada com sucesso.');

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('status', 'error', 'message', SQLERRM);
END;
$$;

-- Garante que apenas usuários autenticados podem chamar esta função
REVOKE ALL ON FUNCTION public.admin_atualizar_senha(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_atualizar_senha(UUID, TEXT) TO authenticated;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--  TESTE IMEDIATO: Redefinir a senha da Eliete agora mesmo
--  (Substitua 'NovaSenha123' pela senha que quiser)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT public.admin_atualizar_senha(
  (SELECT id FROM public.usuarios WHERE email LIKE 'eliete.miranda%' LIMIT 1),
  'RVS@coord2026'   -- ← TROQUE ESTA SENHA PELO VALOR DESEJADO
) AS resultado;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--  Verificação: confirma que auth.users foi atualizado
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT
  u.nome,
  u.email,
  u.perfil,
  au.updated_at AS auth_atualizado_em
FROM public.usuarios u
JOIN auth.users au ON au.id = u.id
WHERE u.email LIKE 'eliete.miranda%';

-- Força reload do schema
NOTIFY pgrst, 'reload schema';
