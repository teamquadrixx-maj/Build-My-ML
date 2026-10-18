create extension if not exists vector;

create table if not exists public.document_chunks (
  id bigint generated always as identity primary key,
  chunk_id text not null unique,
  document_id text not null,
  source text not null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  embedding vector(384) not null,
  created_at timestamptz not null default now()
);

create index if not exists document_chunks_embedding_idx
  on public.document_chunks using hnsw (embedding vector_cosine_ops);

create or replace function public.match_document_chunks(
  query_embedding vector(384),
  match_threshold double precision default 0.0,
  match_count integer default 5
)
returns table (
  id bigint,
  chunk_id text,
  document_id text,
  source text,
  content text,
  metadata jsonb,
  similarity double precision
)
language sql
stable
as $$
  select
    d.id,
    d.chunk_id,
    d.document_id,
    d.source,
    d.content,
    d.metadata,
    1 - (d.embedding <=> query_embedding) as similarity
  from public.document_chunks d
  where 1 - (d.embedding <=> query_embedding) >= match_threshold
  order by d.embedding <=> query_embedding
  limit match_count;
$$;

alter table public.document_chunks enable row level security;
