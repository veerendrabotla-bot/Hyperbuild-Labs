
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, Briefcase, LogOut, Settings, Calendar, LayoutDashboard, CheckSquare, DollarSign, UserPlus, Globe, Zap, MessageSquareQuote, HelpCircle, Tag, ExternalLink } from 'lucide-react';
import { AdminUser } from '../../types';

interface AdminSidebarProps {
  user: AdminUser | null;
  activeTab: string;
  setActiveTab: (tab: 'home' | 'leads' | 'blog' | 'projects' | 'appointments' | 'settings' | 'kanban' | 'invoices' | 'team' | 'content' | 'services' | 'testimonials' | 'faqs' | 'pricing') => void;
  onSignOut: () => void;
  className?: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ user, activeTab, setActiveTab, onSignOut, className = '' }) => {
  const navigate = useNavigate();

  const menuItems = [
    { id: 'home', label: 'Overview', icon: LayoutDashboard },
    { id: 'leads', label: 'CRM / Leads', icon: Users },
    { id: 'kanban', label: 'Projects / Tasks', icon: CheckSquare },
    { id: 'appointments', label: 'Calendar', icon: Calendar },
    { id: 'invoices', label: 'Financials', icon: DollarSign },
    { id: 'services', label: 'Services', icon: Zap },
    { id: 'projects', label: 'Portfolio', icon: Briefcase },
    { id: 'blog', label: 'Blog Posts', icon: FileText },
    { id: 'pricing', label: 'Pricing Tiers', icon: Tag },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle },
    { id: 'content', label: 'Site Content', icon: Globe },
    { id: 'team', label: 'Team', icon: UserPlus },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`w-64 bg-secondary-900 text-white flex-shrink-0 flex-col border-r border-slate-800 ${className}`}>
      <div className="p-6 border-b border-slate-800 flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Zap size={18} fill="currentColor" />
            </div>
            HyperPanel
          </h2>
          <p className="text-[10px] text-slate-500 mt-1 uppercase font-black tracking-widest">{user?.email}</p>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="flex items-center justify-between px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold transition-all border border-slate-700 text-slate-300"
        >
          Visit Public Site <ExternalLink size={12} />
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 mb-1 group ${
              activeTab === item.id 
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/40' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <item.icon size={18} className={`mr-3 transition-transform ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
            <span className="text-sm font-semibold">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800 mt-auto">
        <button 
          onClick={onSignOut}
          className="w-full flex items-center p-3 text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10 font-bold text-sm"
        >
          <LogOut size={18} className="mr-3" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
