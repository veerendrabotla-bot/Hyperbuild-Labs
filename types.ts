
import { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  icon_name?: string;
  features: string[];
  category: 'AI' | 'Web' | 'Automation' | 'Branding';
}

export interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  impact: string;
  techStack: string[];
  client?: string;
  client_email?: string;
  duration?: string;
  challenge?: string;
  solution?: string;
  results?: string[];
  status: 'planning' | 'development' | 'review' | 'completed';
  is_portfolio: boolean;
  is_active: boolean;
  repo_link?: string;
  documentation_link?: string;
  live_link?: string;
  created_at?: string;
  
  // Financials & Referrals
  total_amount: number;
  paid_amount: number;
  currency: 'USD' | 'INR';
  commission_amount: number;
  employee_id?: string; // Links to the partner who referred it
  
  // Visibility
  show_repo: boolean;
  show_docs: boolean;
  show_live: boolean;
  show_financials: boolean;
  show_lifecycle: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'employee';
  is_approved: boolean;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  service: string;
  budget?: string;
  timeline?: string;
  message: string;
  status: 'new' | 'contacted' | 'closed';
  admin_notes?: string;
  created_at: string;
  employee_id?: string; // Tracks which partner referred the lead
}

export interface Appointment {
  id: string;
  name: string;
  email: string;
  date: string;
  notes?: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
}

export interface SearchResult {
  id: string;
  title: string;
  type: 'service' | 'project' | 'blog';
  description: string;
  link: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assigned_to?: string;
  due_date?: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  client_name: string;
  client_email?: string;
  amount: number;
  currency: 'USD' | 'INR';
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  due_date?: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  is_approved: boolean;
  avatar?: string;
  created_at: string;
}

export interface SiteSetting {
  key: string;
  value: string;
  description?: string;
}

/* FIX: Added missing PricingTier interface */
export interface PricingTier {
  id?: string;
  name: string;
  price: string;
  currency: 'USD' | 'INR';
  description: string;
  features: string[];
  recommended?: boolean;
  is_recommended?: boolean;
  order_index?: number;
}

/* FIX: Added missing Testimonial interface */
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar: string;
  created_at?: string;
}

/* FIX: Added missing FaqItem interface */
export interface FaqItem {
  id?: string;
  question: string;
  answer: string;
  order_index?: number;
}

/* FIX: Added missing BlogPost interface */
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  tags: string[];
  content: string;
  created_at?: string;
  read_time?: string;
}
