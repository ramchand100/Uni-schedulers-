-- Uni Schedulers: initial schema (profiles, semesters, courses, class_sessions, friendships)
-- All tables live in `public`, FK'd to Supabase's built-in `auth.users`.
-- Row Level Security is enabled on every table; see the policy sections below.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  full_name text,
  university text,
  avatar_color text not null default '#4F46E5',
  active_days smallint[] not null default '{1,2,3,4,5}',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-z0-9_]{3,20}$'),
  constraint active_days_valid check (
    active_days <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[]
  )
);

-- ---------------------------------------------------------------------------
-- semesters
-- ---------------------------------------------------------------------------

create table public.semesters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  term text not null check (term in ('Fall', 'Spring', 'Summer')),
  year int not null check (year between 2000 and 2100),
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, term, year)
);

-- ---------------------------------------------------------------------------
-- courses
-- ---------------------------------------------------------------------------

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  semester_id uuid not null references public.semesters (id) on delete cascade,
  -- Denormalized from semesters.user_id so RLS policies can check ownership
  -- and friendship without an extra join on every row.
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  course_code text,
  instructor text,
  credit_hours numeric(3, 1) not null check (credit_hours > 0),
  section text,
  room text,
  color text not null default '#4F46E5',
  created_at timestamptz not null default now()
);

create index courses_semester_id_idx on public.courses (semester_id);

-- ---------------------------------------------------------------------------
-- class_sessions (a course's individual weekly meeting times)
-- ---------------------------------------------------------------------------

create table public.class_sessions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  -- Denormalized from courses.user_id, same reasoning as above.
  user_id uuid not null references public.profiles (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  session_type text not null default 'lecture' check (session_type in ('lecture', 'lab', 'tutorial')),
  constraint end_after_start check (end_time > start_time)
);

create index class_sessions_user_day_idx on public.class_sessions (user_id, day_of_week);
create index class_sessions_course_id_idx on public.class_sessions (course_id);

-- ---------------------------------------------------------------------------
-- friendships (directional request, one row per unordered pair)
-- ---------------------------------------------------------------------------

create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  addressee_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint no_self_friendship check (requester_id <> addressee_id)
);

-- Prevents duplicate/reverse-duplicate requests between the same two users.
create unique index friendships_unordered_pair_idx
  on public.friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));

create index friendships_requester_idx on public.friendships (requester_id);
create index friendships_addressee_idx on public.friendships (addressee_id);

-- ---------------------------------------------------------------------------
-- is_friend(): reusable accepted-friendship check, used by RLS policies below.
-- ---------------------------------------------------------------------------

create or replace function public.is_friend(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.friendships f
    where f.status = 'accepted'
      and (
        (f.requester_id = auth.uid() and f.addressee_id = target)
        or (f.addressee_id = auth.uid() and f.requester_id = target)
      )
  );
$$;

-- ---------------------------------------------------------------------------
-- profiles auto-create trigger (one row per new auth.users signup)
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, 'user_' || substr(new.id::text, 1, 8));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- search_users(): minimal profile lookup by username for the friend-add flow.
-- security definer so it can return non-friends' basic info without opening
-- up the `profiles` SELECT policy itself.
-- ---------------------------------------------------------------------------

create or replace function public.search_users(query text)
returns table (id uuid, username text, full_name text, avatar_color text)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.username, p.full_name, p.avatar_color
  from public.profiles p
  where p.username ilike '%' || query || '%'
    and p.id <> auth.uid()
  order by p.username
  limit 20;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.semesters enable row level security;
alter table public.courses enable row level security;
alter table public.class_sessions enable row level security;
alter table public.friendships enable row level security;

-- profiles: owner full access; accepted friends can read.
create policy "profiles_select_own_or_friend" on public.profiles
  for select using (id = auth.uid() or public.is_friend(id));

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

-- Row insert happens via the handle_new_user trigger (security definer), not
-- directly by users, so no INSERT policy is granted here.

-- semesters: owner full CRUD; accepted friends can read.
create policy "semesters_select_own_or_friend" on public.semesters
  for select using (user_id = auth.uid() or public.is_friend(user_id));

create policy "semesters_insert_own" on public.semesters
  for insert with check (user_id = auth.uid());

create policy "semesters_update_own" on public.semesters
  for update using (user_id = auth.uid());

create policy "semesters_delete_own" on public.semesters
  for delete using (user_id = auth.uid());

-- courses: owner full CRUD; accepted friends can read.
create policy "courses_select_own_or_friend" on public.courses
  for select using (user_id = auth.uid() or public.is_friend(user_id));

create policy "courses_insert_own" on public.courses
  for insert with check (user_id = auth.uid());

create policy "courses_update_own" on public.courses
  for update using (user_id = auth.uid());

create policy "courses_delete_own" on public.courses
  for delete using (user_id = auth.uid());

-- class_sessions: owner full CRUD; accepted friends can read.
create policy "class_sessions_select_own_or_friend" on public.class_sessions
  for select using (user_id = auth.uid() or public.is_friend(user_id));

create policy "class_sessions_insert_own" on public.class_sessions
  for insert with check (user_id = auth.uid());

create policy "class_sessions_update_own" on public.class_sessions
  for update using (user_id = auth.uid());

create policy "class_sessions_delete_own" on public.class_sessions
  for delete using (user_id = auth.uid());

-- friendships: either party can see a row; only the requester can create one;
-- only the addressee can accept/decline; either party can remove (unfriend).
create policy "friendships_select_involved" on public.friendships
  for select using (requester_id = auth.uid() or addressee_id = auth.uid());

create policy "friendships_insert_as_requester" on public.friendships
  for insert with check (requester_id = auth.uid());

create policy "friendships_update_as_addressee" on public.friendships
  for update
  using (addressee_id = auth.uid())
  with check (addressee_id = auth.uid());

create policy "friendships_delete_involved" on public.friendships
  for delete using (requester_id = auth.uid() or addressee_id = auth.uid());
