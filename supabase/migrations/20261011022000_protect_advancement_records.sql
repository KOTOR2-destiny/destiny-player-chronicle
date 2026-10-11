-- Preserve recovery and independent rewards when an older open client saves.
create or replace function public.protect_character_advancement_records()
returns trigger language plpgsql security invoker set search_path='' as $$
declare ledger text; old_entries jsonb; next_entries jsonb;
begin
 foreach ledger in array array['history','entitlements'] loop
  old_entries:=case when jsonb_typeof(old.sheet->'advancement'->ledger)='array' then old.sheet->'advancement'->ledger else '[]'::jsonb end;
  next_entries:=case when jsonb_typeof(new.sheet->'advancement'->ledger)='array' then new.sheet->'advancement'->ledger else '[]'::jsonb end;
  if exists(select 1 from jsonb_array_elements(old_entries) prior where prior->>'id' is not null and not exists(select 1 from jsonb_array_elements(next_entries) following where following->>'id'=prior->>'id')) then
   raise exception 'Newer advancement records detected. Reload the Chronicle before saving.' using errcode='40001';
  end if;
 end loop;
 return new;
end $$;
revoke all on function public.protect_character_advancement_records() from public,anon;
grant execute on function public.protect_character_advancement_records() to authenticated;
drop trigger if exists character_sheets_protect_advancement_records on public.character_sheets;
create trigger character_sheets_protect_advancement_records before update of sheet on public.character_sheets for each row execute function public.protect_character_advancement_records();
