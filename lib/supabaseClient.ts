import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants';

// Create a single supabase client for interacting with your database
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * 🚨 CRITICAL DB FIX 🚨
 * 
 * RUN THIS in Supabase SQL Editor to enable the new features:
 * 
 * -- 1. Add Phone to Leads
 * alter table leads add column if not exists phone text;
 * 
 * -- 2. Add CRM Notes to Leads (if missed earlier)
 * alter table leads add column if not exists admin_notes text;
 * 
 * -- 3. Create Site Settings (CMS)
 * create table if not exists site_settings (
 *   key text primary key,
 *   value text,
 *   description text,
 *   updated_at timestamp with time zone default timezone('utc'::text, now())
 * );
 * 
 * alter table site_settings enable row level security;
 * 
 * drop policy if exists "Public view settings" on site_settings;
 * create policy "Public view settings" on site_settings for select using (true);
 * 
 * drop policy if exists "Admin update settings" on site_settings;
 * create policy "Admin update settings" on site_settings for all using (auth.role() = 'authenticated');
 * 
 * -- 4. Insert Default Data
 * insert into site_settings (key, value, description) values
 *   ('company_name', 'HyperBuild Labs', 'Name of the agency'),
 *   ('contact_email', 'hello@hyperbuildlabs.com', 'Primary contact email'),
 *   ('contact_phone', '+1 (555) 123-4567', 'Primary phone number'),
 *   ('contact_address', '123 Innovation Dr, Tech City', 'Physical address'),
 *   ('hero_title', 'AI-Powered Websites & Automation', 'Main headline on Home page'),
 *   ('hero_subtitle', 'We build enterprise-grade digital experiences that grow your business on autopilot.', 'Subtitle on Home page'),
 *   ('whatsapp_link', 'https://wa.me/1234567890', 'WhatsApp direct link'),
 *   ('logo_url', '', 'URL of the company logo'),
 *   ('social_twitter', 'https://twitter.com', 'Twitter Profile URL'),
 *   ('social_linkedin', 'https://linkedin.com', 'LinkedIn Profile URL'),
 *   ('social_instagram', 'https://instagram.com', 'Instagram Profile URL')
 * on conflict (key) do nothing;
 * 
 * -- 5. Create Services Table
 * create table if not exists services (
 *   id uuid default gen_random_uuid() primary key,
 *   title text not null,
 *   description text,
 *   icon_name text default 'Zap',
 *   category text,
 *   features text[],
 *   created_at timestamp with time zone default timezone('utc'::text, now())
 * );
 * 
 * alter table services enable row level security;
 * 
 * drop policy if exists "Public view services" on services;
 * create policy "Public view services" on services for select using (true);
 * 
 * drop policy if exists "Admin manage services" on services;
 * create policy "Admin manage services" on services for all using (auth.role() = 'authenticated');
 */