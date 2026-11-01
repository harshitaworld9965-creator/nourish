-- Nourish sync table. Run once in Supabase → SQL Editor.
-- One row per record: settings, foods, templates, weight, workouts, day:YYYY-MM-DD

create table if not exists public.nourish_records (
  user_id    uuid        not null default auth.uid() references auth.users on delete cascade,
  key        text        not null,
  value      jsonb       not null,
  updated_at timestamptz not null,               -- when you made the edit (device clock)
  synced_at  timestamptz not null default now(), -- when the server received it (pull cursor)
  primary key (user_id, key)
);

create index if not exists nourish_records_user_synced on public.nourish_records (user_id, synced_at);

-- Row Level Security: each account can only see and change its own rows
alter table public.nourish_records enable row level security;

drop policy if exists "Own records" on public.nourish_records;
create policy "Own records" on public.nourish_records
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Stamp synced_at on every write, and refuse to overwrite a newer edit with an older one
create or replace function public.nourish_before_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and new.updated_at < old.updated_at then
    return old;
  end if;
  new.synced_at := now();
  return new;
end;
$$;

drop trigger if exists nourish_before_write on public.nourish_records;
create trigger nourish_before_write
  before insert or update on public.nourish_records
  for each row execute function public.nourish_before_write();
