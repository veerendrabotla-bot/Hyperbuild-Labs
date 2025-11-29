import { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
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
}