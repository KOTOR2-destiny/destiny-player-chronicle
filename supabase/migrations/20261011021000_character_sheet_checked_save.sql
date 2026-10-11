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
  if result.sheet is distinct from expected_sheet then raise exception 'Character changed elsewhere. Reload before saving.' using errcode='40001'; end if;
  update public.character_sheets set sheet=next_sheet,character_name=next_character_name,player_name=next_player_name where user_id=auth.uid() returning * into result;
 else
  if expected_sheet is not null then raise exception 'Character changed elsewhere. Reload before saving.' using errcode='40001'; end if;
  insert into public.character_sheets(user_id,sheet,character_name,player_name) values(auth.uid(),next_sheet,next_character_name,next_player_name) returning * into result;
 end if;
 return result;
end $$;
revoke all on function public.save_character_sheet_checked(jsonb,jsonb,text,text) from public,anon;
grant execute on function public.save_character_sheet_checked(jsonb,jsonb,text,text) to authenticated;
