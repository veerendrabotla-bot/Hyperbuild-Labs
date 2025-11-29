import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { LogOut, Menu, X, LayoutDashboard } from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminLeads from '../components/admin/AdminLeads';
import AdminBlog from '../components/admin/AdminBlog';
import AdminProjects from '../components/admin/AdminProjects';
import AdminAppointments from '../components/admin/AdminAppointments';
import AdminSettings from '../components/admin/AdminSettings';
import AdminHome from '../components/admin/AdminHome';
import AdminKanban from '../components/admin/AdminKanban';
import AdminInvoices from '../components/admin/AdminInvoices';
import AdminTeam from '../components/admin/AdminTeam';
import { useToast } from '../contexts/ToastContext';

const AdminDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { success } = useToast();
  const [activeTab, setActiveTab] = useState<'home' | 'leads' | 'blog' | 'projects' | 'settings' | 'appointments' | 'kanban' | 'invoices' | 'team'>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    success('Logged out successfully');
    navigate('/admin/login');
  };

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex h-screen overflow-hidden">
      <SEO title="Admin Dashboard" description="Manage your agency" />

      {/* Desktop Sidebar */}
      <AdminSidebar 
        className="hidden md:flex h-full"
        user={user} 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        onSignOut={handleSignOut} 
      />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 md:hidden animate-fadeIn" onClick={() => setIsSidebarOpen(false)}>
           <div className="bg-secondary-900 h-full w-64 relative shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 text-white z-10">
                <X size={24} />
              </button>
              <AdminSidebar 
                className="flex h-full w-full"
                user={user} 
                activeTab={activeTab} 
                setActiveTab={handleTabChange} 
                onSignOut={handleSignOut} 
              />
           </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden bg-secondary-900 text-white p-4 flex justify-between items-center z-10 flex-shrink-0 shadow-md">
           <div className="flex items-center">
             <button onClick={() => setIsSidebarOpen(true)} className="mr-3 p-1 hover:bg-white/10 rounded-md"><Menu size={24} /></button>
             <div>
                <span className="font-bold block leading-tight">Admin Panel</span>
                <span className="text-[10px] text-slate-300 font-normal">{user?.email}</span>
             </div>
           </div>
           <button onClick={handleSignOut} className="p-2 hover:bg-white/10 rounded-md"><LogOut size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-8 pb-0">
            <h1 className="text-2xl font-bold text-slate-900 capitalize flex items-center gap-2">
              {activeTab === 'home' && <><LayoutDashboard className="text-brand-600"/> Dashboard Overview</>}
              {activeTab === 'leads' && 'Lead Management'}
              {activeTab === 'appointments' && 'Calendar Bookings'}
              {activeTab === 'blog' && 'Blog Management'}
              {activeTab === 'projects' && 'Portfolio Management'}
              {activeTab === 'settings' && 'System Settings'}
              {activeTab === 'kanban' && 'Project Tasks'}
              {activeTab === 'invoices' && 'Invoices & Financials'}
              {activeTab === 'team' && 'Team Management'}
            </h1>
            <p className="text-slate-500 mt-1">
              {activeTab === 'home' ? 'Overview of your agency performance.' : `Manage ${activeTab.replace('-', ' ')}.`}
            </p>
          </div>

          <div className="p-8 pb-20">
            {activeTab === 'home' && <AdminHome />}
            {activeTab === 'leads' && <AdminLeads />}
            {activeTab === 'appointments' && <AdminAppointments />}
            {activeTab === 'blog' && <AdminBlog />}
            {activeTab === 'projects' && <AdminProjects />}
            {activeTab === 'settings' && <AdminSettings />}
            {activeTab === 'kanban' && <AdminKanban />}
            {activeTab === 'invoices' && <AdminInvoices />}
            {activeTab === 'team' && <AdminTeam />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;