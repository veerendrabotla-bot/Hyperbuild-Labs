
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * 🚀 ENTERPRISE DATABASE SCHEMA UPDATE 🚀
 * 
 * RUN THIS in your Supabase SQL Editor to enable tracking and fix schema errors:
 * 
 * -- 1. Fix Projects Table (Adding tracking & visibility columns)
 * alter table projects add column if not exists client text;
 * alter table projects add column if not exists client_email text;
 * alter table projects add column if not exists status text default 'planning'; -- planning, development, review, completed
 * alter table projects add column if not exists is_portfolio boolean default false; -- false = Private, true = Public
 * alter table projects add column if not exists is_active boolean default true;
 * alter table projects add column if not exists repo_link text;
 * alter table projects add column if not exists documentation_link text;
 * alter table projects add column if not exists live_link text;
 * alter table projects add column if not exists tech_stack text[] default '{}';
 * alter table projects add column if not exists results text[] default '{}';
 * alter table projects add column if not exists total_amount numeric default 0;
 * alter table projects add column if not exists paid_amount numeric default 0;
 * alter table projects add column if not exists currency text default 'USD';
 * alter table projects add column if not exists show_repo boolean default true;
 * alter table projects add column if not exists show_docs boolean default true;
 * alter table projects add column if not exists show_live boolean default true;
 * alter table projects add column if not exists show_financials boolean default true;
 * alter table projects add column if not exists show_lifecycle boolean default true;
 * 
 * -- 2. Ensure RLS is configured (optional for dev)
 * -- alter table projects enable row level security;
 * -- create policy "Public projects are viewable by everyone" on projects for select using (is_portfolio = true and is_active = true);
 */
