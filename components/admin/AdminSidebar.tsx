import React from 'react';
import { Users, FileText, Briefcase, LogOut, Settings, Calendar, LayoutDashboard, CheckSquare, DollarSign, UserPlus, Globe } from 'lucide-react';
import { AdminUser } from '../../types';

interface AdminSidebarProps {
  user: AdminUser | null;
  activeTab: string;
  setActiveTab: (tab: 'home' | 'leads' | 'blog' | 'projects' | 'appointments' | 'settings' | 'kanban' | 'invoices' | 'team' | 'content') => void;
  onSignOut: () => void;
  className?: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ user, activeTab, setActiveTab, onSignOut, className = '' }) => {
  const menuItems = [
    { id: 'home', label: 'Overview', icon: LayoutDashboard },
    { id: 'leads', label: 'CRM / Leads', icon: Users },
    { id: 'kanban', label: 'Projects / Tasks', icon: CheckSquare },
    { id: 'appointments', label: 'Calendar', icon: Calendar },
    { id: 'invoices', label: 'Financials', icon: DollarSign },
    { id: 'blog', label: 'Blog Posts', icon: FileText },
    { id: 'projects', label: 'Portfolio', icon: Briefcase },
    { id: 'content', label: 'Site Content', icon: Globe },
    { id: 'team', label: 'Team', icon: UserPlus },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`w-64 bg-secondary-900 text-white flex-shrink-0 flex-col ${className}`}>
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-bold">HyperBuild Admin</h2>
        <p className="text-xs text-slate-400 mt-1">Logged in as: {user?.email}</p>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`w-full flex items-center p-3 rounded-lg transition-colors mb-1 ${
              activeTab === item.id 
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={18} className="mr-3" />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800 mt-auto">
        <button 
          onClick={onSignOut}
          className="w-full flex items-center p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
        >
          <LogOut size={18} className="mr-3" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
