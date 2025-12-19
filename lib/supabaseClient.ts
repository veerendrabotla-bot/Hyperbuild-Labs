
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * 🚀 ENTERPRISE DATABASE SCHEMA UPDATE (V3 - RELATIONSHIPS) 🚀
 * 
 * 1. RUN THIS to automate profile creation on signup:
 * 
 * CREATE OR REPLACE FUNCTION public.handle_new_user()
 * RETURNS trigger AS $$
 * BEGIN
 *   INSERT INTO public.team_members (id, name, email, role, is_approved, created_at)
 *   VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, 'employee', false, now());
 *   RETURN new;
 * END;
 * $$ LANGUAGE plpgsql SECURITY DEFINER;
 * 
 * CREATE TRIGGER on_auth_user_created
 *   AFTER INSERT ON auth.users
 *   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
 * 
 * 2. ESTABLISH RELATIONSHIPS (CRITICAL FOR CRM):
 * 
 * -- Link Leads to the Partner who referred them
 * ALTER TABLE public.leads
 * ADD CONSTRAINT leads_employee_id_fkey 
 * FOREIGN KEY (employee_id) REFERENCES public.team_members(id) ON DELETE SET NULL;
 * 
 * -- Link Projects to the Partner for Commissions
 * ALTER TABLE public.projects
 * ADD CONSTRAINT projects_employee_id_fkey 
 * FOREIGN KEY (employee_id) REFERENCES public.team_members(id) ON DELETE SET NULL;
 * 
 * 3. FIX RLS:
 * 
 * CREATE POLICY "Users can read own record" ON public.team_members
 * FOR SELECT TO authenticated USING (auth.uid() = id);
 * 
 * -- Admin Global Access
 * DO $$ 
 * DECLARE
 *     t text;
 *     tables text[] := ARRAY['team_members', 'leads', 'projects', 'posts', 'invoices', 'appointments', 'services', 'testimonials', 'faqs', 'pricing_tiers', 'subscribers', 'site_settings', 'tasks'];
 * BEGIN
 *     FOR t IN SELECT unnest(tables) LOOP
 *         EXECUTE format('ALTER TABLE IF EXISTS public.%I ENABLE ROW LEVEL SECURITY', t);
 *         EXECUTE format('DROP POLICY IF EXISTS "Admin full access" ON public.%I', t);
 *         EXECUTE format('CREATE POLICY "Admin full access" ON public.%I FOR ALL TO authenticated 
 *             USING ((auth.jwt() -> ''user_metadata'' ->> ''role'') = ''admin'')', t);
 *     END LOOP;
 * END $$;
 */
