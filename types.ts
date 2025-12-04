import { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon?: LucideIcon; // Optional for static fallback
  icon_name?: string; // For DB storage
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
  // New fields for Case Study page
  client?: string;
  duration?: string;
  challenge?: string;
  solution?: string;
  results?: string[];
}

export interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  recommended?: boolean;
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
  question: string;
  answer: string;
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
  phone?: string; // New Field
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
  date: string; // ISO String
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

// -- OPERATIONS TYPES --

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