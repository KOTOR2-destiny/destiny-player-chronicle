-- Business conflicts must not use serialization_failure (40001): PostgREST 14
-- retries that code indefinitely, even after the originating browser closes.
-- PT409 returns HTTP 409 without retrying. Preserve RLS, row locks and ledgers.
-- https://supabase.com/kb/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions

-- Atomic character-sheet save with optimistic concurrency and existing RLS.
create or replace function public.save_character_sheet_checked(expected_sheet jsonb, next_sheet jsonb, next_character_name text, next_player_name text)
returns public.character_sheets
language plpgsql security invoker set search_path = '' as $$
declare result public.character_sheets;
begin
 if auth.uid() is null then raise exception 'Sign in to save your character'; end if;
 if next_sheet is null or jsonb_typeof(next_sheet) <> 'object' then raise exception 'Invalid character sheet'; end if;
 select * into result from public.character_sheets where user_id=auth.uid() for update;
 if found then
  if result.sheet is distinct from expected_sheet then raise exception 'Character changed elsewhere. Reload before saving.' using errcode='PT409'; end if;
  update public.character_sheets set sheet=next_sheet,character_name=next_character_name,player_name=next_player_name where user_id=auth.uid() returning * into result;
 else
  if expected_sheet is not null then raise exception 'Character changed elsewhere. Reload before saving.' using errcode='PT409'; end if;
  insert into public.character_sheets(user_id,sheet,character_name,player_name) values(auth.uid(),next_sheet,next_character_name,next_player_name) returning * into result;
 end if;
 return result;
end $$;

-- Preserve recovery and independent rewards when an older open client saves.
create or replace function public.protect_character_advancement_records()
returns trigger language plpgsql security invoker set search_path='' as $$
declare ledger text; old_entries jsonb; next_entries jsonb;
begin
 foreach ledger in array array['history','entitlements'] loop
  old_entries:=case when jsonb_typeof(old.sheet->'advancement'->ledger)='array' then old.sheet->'advancement'->ledger else '[]'::jsonb end;
  next_entries:=case when jsonb_typeof(new.sheet->'advancement'->ledger)='array' then new.sheet->'advancement'->ledger else '[]'::jsonb end;
  if exists(select 1 from jsonb_array_elements(old_entries) prior where prior->>'id' is not null and not exists(select 1 from jsonb_array_elements(next_entries) following where following->>'id'=prior->>'id')) then
   raise exception 'Newer advancement records detected. Reload the Chronicle before saving.' using errcode='PT409';
  end if;
 end loop;
 return new;
end $$;
