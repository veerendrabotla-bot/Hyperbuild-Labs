import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants';

// Create a single supabase client for interacting with your database
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * 🚨 CRITICAL DB FIX 🚨
 * 
 * If you see "Could not find the 'budget' column", RUN THIS in Supabase SQL Editor:
 * 
 * alter table leads add column if not exists budget text;
 * alter table leads add column if not exists timeline text;
 * 
 * =========================================================
 * 
 * FULL SETUP SCRIPT (Idempotent):
 * 
 * -- 1. Create Tables
 * create table if not exists leads (
 *   id uuid default gen_random_uuid() primary key,
 *   name text not null,
 *   email text not null,
 *   service text,
 *   budget text,    -- New field
 *   timeline text,  -- New field
 *   message text,
 *   status text default 'new',
 *   created_at timestamp with time zone default timezone('utc'::text, now())
 * );
 * 
 * create table if not exists posts (
 *   id uuid default gen_random_uuid() primary key,
 *   title text not null,
 *   excerpt text,
 *   content text,
 *   image text,
 *   category text,
 *   author text,
 *   tags text[],
 *   read_time text,
 *   created_at timestamp with time zone default timezone('utc'::text, now())
 * );
 * 
 * create table if not exists projects (
 *   id uuid default gen_random_uuid() primary key,
 *   title text not null,
 *   category text,
 *   image text,
 *   description text,
 *   impact text,
 *   tech_stack text[],
 *   client text,
 *   duration text,
 *   challenge text,
 *   solution text,
 *   results text[],
 *   created_at timestamp with time zone default timezone('utc'::text, now())
 * );
 * 
 * create table if not exists appointments (
 *   id uuid default gen_random_uuid() primary key,
 *   name text not null,
 *   email text not null,
 *   date timestamp with time zone not null,
 *   notes text,
 *   status text default 'confirmed',
 *   created_at timestamp with time zone default timezone('utc'::text, now())
 * );
 * 
 * -- NEW: OPERATIONS TABLES --
 * 
 * create table if not exists tasks (
 *   id uuid default gen_random_uuid() primary key,
 *   title text not null,
 *   description text,
 *   status text default 'todo', 
 *   priority text default 'medium',
 *   assigned_to text,
 *   due_date timestamp with time zone,
 *   created_at timestamp with time zone default timezone('utc'::text, now())
 * );
 * 
 * create table if not exists invoices (
 *   id uuid default gen_random_uuid() primary key,
 *   client_name text not null,
 *   client_email text,
 *   amount numeric not null,
 *   status text default 'draft',
 *   due_date timestamp with time zone,
 *   created_at timestamp with time zone default timezone('utc'::text, now())
 * );
 * 
 * create table if not exists team_members (
 *   id uuid default gen_random_uuid() primary key,
 *   name text not null,
 *   email text not null,
 *   role text default 'member',
 *   avatar text,
 *   created_at timestamp with time zone default timezone('utc'::text, now())
 * );
 * 
 * -- 2. Enable Security (RLS)
 * alter table leads enable row level security;
 * alter table posts enable row level security;
 * alter table projects enable row level security;
 * alter table appointments enable row level security;
 * alter table tasks enable row level security;
 * alter table invoices enable row level security;
 * alter table team_members enable row level security;
 * 
 * -- 3. Policies
 * 
 * -- LEADS
 * drop policy if exists "Public leads insert" on leads;
 * create policy "Public leads insert" on leads for insert with check (true);
 * 
 * drop policy if exists "Admin view leads" on leads;
 * create policy "Admin view leads" on leads for select using (auth.role() = 'authenticated');
 * 
 * drop policy if exists "Admin update leads" on leads;
 * create policy "Admin update leads" on leads for update using (auth.role() = 'authenticated');
 * 
 * -- POSTS
 * drop policy if exists "Public view posts" on posts;
 * create policy "Public view posts" on posts for select using (true);
 * 
 * drop policy if exists "Admin manage posts" on posts;
 * create policy "Admin manage posts" on posts for all using (auth.role() = 'authenticated');
 * 
 * -- PROJECTS
 * drop policy if exists "Public view projects" on projects;
 * create policy "Public view projects" on projects for select using (true);
 * 
 * drop policy if exists "Admin manage projects" on projects;
 * create policy "Admin manage projects" on projects for all using (auth.role() = 'authenticated');
 * 
 * -- APPOINTMENTS
 * drop policy if exists "Public insert appointments" on appointments;
 * create policy "Public insert appointments" on appointments for insert with check (true);
 * 
 * drop policy if exists "Public view appointments" on appointments;
 * create policy "Public view appointments" on appointments for select using (true);
 * 
 * drop policy if exists "Admin manage appointments" on appointments;
 * create policy "Admin manage appointments" on appointments for all using (auth.role() = 'authenticated');
 * 
 * -- OPERATIONS POLICIES (Admin Only)
 * create policy "Admin manage tasks" on tasks for all using (auth.role() = 'authenticated');
 * create policy "Admin manage invoices" on invoices for all using (auth.role() = 'authenticated');
 * create policy "Admin manage team" on team_members for all using (auth.role() = 'authenticated');
 * 
 * -- 4. STORAGE SETUP
 * insert into storage.buckets (id, name, public) values ('uploads', 'uploads', true)
 * on conflict (id) do nothing;
 * 
 * -- Storage Policies
 * drop policy if exists "Public Access" on storage.objects;
 * create policy "Public Access" on storage.objects for select using ( bucket_id = 'uploads' );
 * 
 * drop policy if exists "Admin Upload" on storage.objects;
 * create policy "Admin Upload" on storage.objects for insert with check ( bucket_id = 'uploads' and auth.role() = 'authenticated' );
 * 
 * drop policy if exists "Admin Delete" on storage.objects;
 * create policy "Admin Delete" on storage.objects for delete using ( bucket_id = 'uploads' and auth.role() = 'authenticated' );
 */