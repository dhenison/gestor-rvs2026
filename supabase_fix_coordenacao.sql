-- ══════════════════════════════════════════════════════════════════════
--  RVS ESCOLAR — FIX: Login do perfil Coordenação
--  PROBLEMA: Usuários de Coordenação não conseguem entrar no sistema
--  CAUSA:    provider_id na auth.identities contém e-mail (inválido)
--            em vez do UUID do usuário (correto para GoTrue/Supabase v2)
--  Execute no Supabase: SQL Editor → Cole tudo → Run
-- ══════════════════════════════════════════════════════════════════════

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--  PASSO 1 — DIAGNÓSTICO: Ver todos os usuários e seus perfis
--  (Confirme que o usuário Coordenação existe com perfil correto)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT 
  u.id,
  u.nome,
  u.email,
  u.perfil,
  u.ativo,
  ai.provider_id,
  ai.provider,
  CASE 
    WHEN ai.provider_id LIKE '%@%' THEN '❌ INVÁLIDO (tem @) — causa erro de login'
    ELSE '✅ OK (é UUID)'
  END AS status_provider_id
FROM public.usuarios u
LEFT JOIN auth.identities ai ON ai.user_id = u.id
ORDER BY u.perfil, u.nome;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--  PASSO 2 — CORREÇÃO AUTOMÁTICA
--  Corrige o provider_id de TODOS os usuários que ainda têm e-mail
--  (gerado pela migração v8 — afeta todos os perfis, inclusive Coordenação)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UPDATE auth.identities
SET provider_id = user_id::text
WHERE provider = 'email' 
  AND provider_id LIKE '%@%';

-- Confirma quantos foram corrigidos
DO $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM auth.identities
  WHERE provider = 'email' AND provider_id LIKE '%@%';
  
  IF v_count = 0 THEN
    RAISE NOTICE '✅ CORREÇÃO OK: Todos os provider_id estão no formato UUID.';
  ELSE
    RAISE WARNING '⚠️ Ainda existem % identidade(s) com provider_id inválido!', v_count;
  END IF;
END;
$$;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--  PASSO 3 — Garantir coluna 'ativo' com valor padrão TRUE
--  (Usuários antigos podem ter NULL → bloqueio invisível no login)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE;

-- Corrige usuários com ativo = NULL (não devem ser bloqueados)
UPDATE public.usuarios
SET ativo = TRUE
WHERE ativo IS NULL;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--  PASSO 4 — Verificar especificamente usuários de Coordenação
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT 
  u.nome,
  u.email,
  u.perfil,
  u.ativo,
  au.email_confirmed_at,
  ai.provider_id,
  CASE 
    WHEN ai.provider_id LIKE '%@%' THEN '❌ provider_id INVÁLIDO'
    WHEN au.email_confirmed_at IS NULL THEN '❌ email NÃO confirmado'
    WHEN u.ativo = FALSE THEN '❌ usuário INATIVO'
    ELSE '✅ OK — deve funcionar'
  END AS diagnostico
FROM public.usuarios u
LEFT JOIN auth.users au ON au.id = u.id
LEFT JOIN auth.identities ai ON ai.user_id = u.id
WHERE LOWER(u.perfil) LIKE '%coordenador%'
   OR LOWER(u.perfil) LIKE '%coord%';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--  PASSO 5 — Confirmar que email_confirmed_at está preenchido
--  (Se NULL, o Supabase pode rejeitar o login mesmo com senha certa)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE id IN (
  SELECT id FROM public.usuarios
  WHERE LOWER(perfil) LIKE '%coordenador%'
     OR LOWER(perfil) LIKE '%coord%'
);

-- Aplica também para TODOS os usuários (prevenção geral)
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--  PASSO 6 — VERIFICAÇÃO FINAL
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT 
  u.nome,
  u.email,
  u.perfil,
  u.ativo,
  au.email_confirmed_at IS NOT NULL AS email_confirmado,
  ai.provider_id NOT LIKE '%@%' AS provider_id_correto
FROM public.usuarios u
LEFT JOIN auth.users au ON au.id = u.id
LEFT JOIN auth.identities ai ON ai.user_id = u.id
ORDER BY u.perfil, u.nome;

-- Força reload do schema no PostgREST
NOTIFY pgrst, 'reload schema';

-- ══════════════════════════════════════════════════════════════════════
--  FIM DO SCRIPT
--  Após executar:
--  1. Tente logar novamente com o usuário de Coordenação
--  2. Se ainda falhar, recadastre o usuário usando o botão "+Novo Usuário"
--     (a função admin_criar_usuario v11 já está correta)
-- ══════════════════════════════════════════════════════════════════════
