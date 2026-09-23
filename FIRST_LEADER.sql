-- AFTER running SUPABASE_SETUP.sql:
-- 1. Create your own account using the website's Request access form.
-- 2. Confirm your email and sign in once.
-- 3. Replace the example below with YOUR exact sign-in email, then run this
--    in Supabase SQL Editor (not in the website).
-- No public web page can appoint the first leader.
begin;
do $$
declare owner_email text := 'REPLACE_WITH_YOUR_EMAIL';
        target_id uuid;
begin
 if owner_email='REPLACE_WITH_YOUR_EMAIL' then
  raise exception 'Replace REPLACE_WITH_YOUR_EMAIL with your confirmed sign-in email first.';
 end if;
 select id into target_id from auth.users where lower(email)=lower(trim(owner_email)) and email_confirmed_at is not null;
 if target_id is null then raise exception 'No confirmed account found for this email. Sign up and confirm your email first.'; end if;
 insert into public.church_members(user_id,email,display_name,approved,role)
 values(target_id,owner_email,'Church Administrator',true,'leader')
 on conflict(user_id) do update set approved=true,role='leader',updated_at=now();
end $$;
commit;
-- Refresh the website. You can now approve other members in Announcements > Manage member access.
