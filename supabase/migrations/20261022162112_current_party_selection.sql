-- The roster's shared, explicitly saved current party. No character rows are changed.
create table public.gm_party_settings (
  id text primary key default 'current' check (id = 'current'),
  member_ids uuid[] not null default '{}'::uuid[]
    check (cardinality(member_ids) <= 1000 and array_position(member_ids, null) is null),
  revision integer not null default 1 check (revision > 0),
  updated_at timestamptz not null default now()
);

alter table public.gm_party_settings enable row level security;
revoke all on public.gm_party_settings from anon, authenticated;
grant select, insert, update on public.gm_party_settings to authenticated;

create policy gm_party_settings_read on public.gm_party_settings
  for select to authenticated using ((select public.is_gm()));
create policy gm_party_settings_create on public.gm_party_settings
  for insert to authenticated with check ((select public.is_gm()));
create policy gm_party_settings_update on public.gm_party_settings
  for update to authenticated using ((select public.is_gm()))
  with check ((select public.is_gm()));

comment on table public.gm_party_settings is
  'GM-only current party selection. Empty or absent selection means no party export members.';
