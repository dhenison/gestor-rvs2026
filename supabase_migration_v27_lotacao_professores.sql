create extension if not exists pgcrypto;

create or replace function public.set_lotacao_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.lotacao_professores (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid,
  nome text not null,
  matricula text,
  vinculo text,
  tipo_vinculo text,
  cargo text,
  carga_horaria_maxima numeric(10,2) not null default 200,
  observacoes text,
  ativo boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lotacao_componentes_turma (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid,
  turma_id text not null,
  turma_codigo text not null,
  ano integer not null default (extract(year from now())::integer),
  oferta text,
  modalidade text,
  serie_modalidade text,
  turno text,
  localidade text,
  disciplina text not null,
  carga_horaria_semanal numeric(10,2) not null default 0,
  quantidade_aulas integer not null default 0,
  observacoes text,
  ativo boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lotacao_alocacoes (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid,
  professor_id uuid not null references public.lotacao_professores(id) on delete cascade,
  componente_id uuid not null references public.lotacao_componentes_turma(id) on delete cascade,
  carga_horaria_semanal numeric(10,2) not null default 0,
  data_inicio date not null default current_date,
  data_fim date,
  status text not null default 'ativa' check (status in ('ativa', 'encerrada', 'desistencia')),
  observacoes text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lotacao_desistencias (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid,
  alocacao_id uuid not null references public.lotacao_alocacoes(id) on delete cascade,
  professor_id uuid references public.lotacao_professores(id) on delete set null,
  componente_id uuid references public.lotacao_componentes_turma(id) on delete set null,
  data_desistencia date not null default current_date,
  motivo text not null,
  observacoes text,
  created_by uuid,
  created_at timestamptz not null default now()
);

create index if not exists idx_lotacao_professores_escola on public.lotacao_professores(escola_id);
create index if not exists idx_lotacao_professores_nome on public.lotacao_professores(nome);
create index if not exists idx_lotacao_componentes_escola on public.lotacao_componentes_turma(escola_id);
create index if not exists idx_lotacao_componentes_turma on public.lotacao_componentes_turma(turma_id, turma_codigo);
create index if not exists idx_lotacao_alocacoes_escola on public.lotacao_alocacoes(escola_id);
create index if not exists idx_lotacao_alocacoes_professor on public.lotacao_alocacoes(professor_id);
create index if not exists idx_lotacao_alocacoes_componente on public.lotacao_alocacoes(componente_id);
create index if not exists idx_lotacao_desistencias_escola on public.lotacao_desistencias(escola_id);

drop trigger if exists trg_lotacao_professores_updated_at on public.lotacao_professores;
create trigger trg_lotacao_professores_updated_at
before update on public.lotacao_professores
for each row execute function public.set_lotacao_updated_at();

drop trigger if exists trg_lotacao_componentes_updated_at on public.lotacao_componentes_turma;
create trigger trg_lotacao_componentes_updated_at
before update on public.lotacao_componentes_turma
for each row execute function public.set_lotacao_updated_at();

drop trigger if exists trg_lotacao_alocacoes_updated_at on public.lotacao_alocacoes;
create trigger trg_lotacao_alocacoes_updated_at
before update on public.lotacao_alocacoes
for each row execute function public.set_lotacao_updated_at();

alter table public.lotacao_professores enable row level security;
alter table public.lotacao_componentes_turma enable row level security;
alter table public.lotacao_alocacoes enable row level security;
alter table public.lotacao_desistencias enable row level security;

drop policy if exists lotacao_professores_authenticated_all on public.lotacao_professores;
create policy lotacao_professores_authenticated_all
on public.lotacao_professores
for all
to authenticated
using (true)
with check (true);

drop policy if exists lotacao_componentes_authenticated_all on public.lotacao_componentes_turma;
create policy lotacao_componentes_authenticated_all
on public.lotacao_componentes_turma
for all
to authenticated
using (true)
with check (true);

drop policy if exists lotacao_alocacoes_authenticated_all on public.lotacao_alocacoes;
create policy lotacao_alocacoes_authenticated_all
on public.lotacao_alocacoes
for all
to authenticated
using (true)
with check (true);

drop policy if exists lotacao_desistencias_authenticated_all on public.lotacao_desistencias;
create policy lotacao_desistencias_authenticated_all
on public.lotacao_desistencias
for all
to authenticated
using (true)
with check (true);
