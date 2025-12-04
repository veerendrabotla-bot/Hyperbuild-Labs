import { 
  Bot, Globe, Zap, Palette, Cpu, MessageSquare, 
  BarChart, Code2, ShoppingCart, Smartphone, 
  Database, Cloud, Lock, Search, Megaphone,
  Briefcase, LineChart, Layers, Box, Settings
} from 'lucide-react';

export const iconMap: Record<string, any> = {
  'Bot': Bot,
  'Globe': Globe,
  'Zap': Zap,
  'Palette': Palette,
  'Cpu': Cpu,
  'MessageSquare': MessageSquare,
  'BarChart': BarChart,
  'Code2': Code2,
  'ShoppingCart': ShoppingCart,
  'Smartphone': Smartphone,
  'Database': Database,
  'Cloud': Cloud,
  'Lock': Lock,
  'Search': Search,
  'Megaphone': Megaphone,
  'Briefcase': Briefcase,
  'LineChart': LineChart,
  'Layers': Layers,
  'Box': Box,
  'Settings': Settings
};

export const getIconComponent = (iconName: string | undefined) => {
  if (!iconName) return Zap; // Default fallback
  return iconMap[iconName] || Zap;
};

export const availableIcons = Object.keys(iconMap);