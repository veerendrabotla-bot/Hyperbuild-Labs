
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
  // Delivery & Tracking Fields
  status: 'planning' | 'development' | 'review' | 'completed';
  is_portfolio: boolean; // TRUE: Shown on public website list.
  is_active: boolean;    // MASTER KILL SWITCH: Hide from portal AND public list if FALSE.
  repo_link?: string;
  documentation_link?: string;
  live_link?: string;
  created_at?: string;
  
  // Enterprise Financials
  total_amount: number;
  paid_amount: number;
  currency: 'USD' | 'INR';
  
  // Visibility Toggles (Feature Flags)
  show_repo: boolean;
  show_docs: boolean;
  show_live: boolean;
  show_financials: boolean;
  show_lifecycle: boolean;
}

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

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar: string;
  companyLogo?: string;
}

export interface FaqItem {
  id?: string;
  question: string;
  answer: string;
  order_index?: number;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  tags: string[];
}

export interface AdminUser {
  id: string;
  email: string;
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
  role: 'admin' | 'editor' | 'viewer';
  avatar?: string;
  created_at: string;
}

export interface SiteSetting {
  key: string;
  value: string;
  description?: string;
}
