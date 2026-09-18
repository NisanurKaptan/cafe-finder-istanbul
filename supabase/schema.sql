-- Ratings schema for cafe-finder-istanbul.
-- Run once in the Supabase SQL Editor. Safe to re-run.

-- One rating per visitor per cafe. Visitors sign in anonymously, so
-- user_id is a random id with no personal data attached.
create table if not exists public.ratings (
  cafe_id text not null check (cafe_id ~ '^[nwr][0-9]+$'),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  stars smallint not null check (stars between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (cafe_id, user_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ratings_set_updated_at on public.ratings;
create trigger ratings_set_updated_at
  before update on public.ratings
  for each row execute function public.set_updated_at();

-- Row Level Security: anyone can read, visitors can only change their own rating.
alter table public.ratings enable row level security;

drop policy if exists "Ratings are public" on public.ratings;
create policy "Ratings are public"
  on public.ratings for select
  to anon, authenticated
  using (true);

drop policy if exists "Visitors add their own rating" on public.ratings;
create policy "Visitors add their own rating"
  on public.ratings for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Visitors update their own rating" on public.ratings;
create policy "Visitors update their own rating"
  on public.ratings for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Visitors delete their own rating" on public.ratings;
create policy "Visitors delete their own rating"
  on public.ratings for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Average and count per cafe. security_invoker makes the view respect the
-- RLS policies above instead of running with the owner's rights.
create or replace view public.cafe_rating_stats
with (security_invoker = true) as
select
  cafe_id,
  count(*)::int as rating_count,
  round(avg(stars), 2)::float as rating_avg
from public.ratings
group by cafe_id;

grant select on public.ratings, public.cafe_rating_stats to anon, authenticated;
grant insert, update, delete on public.ratings to authenticated;
