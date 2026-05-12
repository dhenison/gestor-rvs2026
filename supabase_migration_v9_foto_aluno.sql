-- Migração para adicionar foto_url aos alunos

ALTER TABLE alunos ADD COLUMN IF NOT EXISTS foto_url TEXT;
