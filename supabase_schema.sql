-- Enable the UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- 1. Create a table for public profiles
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS) for profiles
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- 2. Create a table for practice sessions
create table if not exists practice_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  industry text not null,
  score integer not null,
  duration integer not null, -- in seconds
  tempo integer, -- words per minute
  filler_count integer,
  feedback text[], -- array of strings
  transcript jsonb -- stores the conversation history and other metadata
);

-- Set up RLS for practice_sessions
alter table practice_sessions enable row level security;

create policy "Users can view their own practice sessions." on practice_sessions
  for select using (auth.uid() = user_id);

create policy "Users can insert their own practice sessions." on practice_sessions
  for insert with check (auth.uid() = user_id);

-- 3. Create a table for user badges
create table if not exists user_badges (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  badge_id text not null,
  earned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(user_id, badge_id) -- prevent duplicate badges for the same user
);

-- Set up RLS for user_badges
alter table user_badges enable row level security;

create policy "Users can view their own badges." on user_badges
  for select using (auth.uid() = user_id);

create policy "Users can insert their own badges." on user_badges
  for insert with check (auth.uid() = user_id);

-- 4. Function to handle new user creation (automatically creates a profile)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on new user creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
