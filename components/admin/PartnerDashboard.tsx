
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Lead, Project, AdminUser } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import { 
  Users, Target, DollarSign, Plus, Briefcase, 
  TrendingUp, ExternalLink, Zap, RefreshCw, Loader2, Send, LogOut,
  FileText, Download, Image as ImageIcon, Layout, ShieldCheck
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

interface PartnerDashboardProps {
  user: AdminUser | null;
}

const PartnerDashboard: React.FC<PartnerDashboardProps> = ({ user }) => {
  const { signOut } = useAuth();
  const { success, error: showError } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'assets'>('pipeline');
  
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    service: 'Web Development',
    budget: '',
    message: ''
  });

  useEffect(() => {
    if (user) fetchPartnerData();
  }, [user]);

  const fetchPartnerData = async () => {
    setLoading(true);
    try {
      const [leadsRes, projectsRes] = await Promise.all([
        supabase.from('leads').select('*').eq('employee_id', user?.id).order('created_at', { ascending: false }),
        supabase.from('projects').select('*').eq('employee_id', user?.id).order('created_at', { ascending: false })
      ]);

      if (leadsRes.data) setLeads(leadsRes.data as Lead[]);
      if (projectsRes.data) setProjects(projectsRes.data as Project[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      success('Secure session terminated');
    } catch (err) {
      showError('Logout failed');
    }
  };

  const handleSubmitLead = async () => {
    if (!newLead.name || !newLead.email) return;
    try {
      const { error } = await supabase.from('leads').insert([{
        ...newLead,
        employee_id: user?.id,
        status: 'new'
      }]);
      if (error) throw error;
      success('Referral submitted successfully');
      setIsModalOpen(false);
      fetchPartnerData();
      setNewLead({ name: '', email: '', service: 'Web Development', budget: '', message: '' });
    } catch (err: any) {
      showError(err.message);
    }
  };

  const earnings = projects.reduce((acc, p) => acc + (p.commission_amount || 0), 0);

  const agencyAssets = [
    { title: 'Agency Pitch Deck 2024', type: 'PDF', size: '4.2 MB', icon: FileText, color: 'text-red-500' },
    { title: 'Brand Identity Kit', type: 'ZIP', size: '12.8 MB', icon: ImageIcon, color: 'text-blue-500' },
    { title: 'AI Solutions One-Pager', type: 'PDF', size: '1.1 MB', icon: Layout, color: 'text-purple-500' },
    { title: 'Partner Agreement', type: 'DOCX', size: '0.5 MB', icon: ShieldCheck, color: 'text-green-500' },
  ];

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-600 w-12 h-12"/></div>;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Header */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 shadow-inner">
             <Zap size={28} fill="currentColor" />
           </div>
           <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Growth Partner Hub</h2>
              <p className="text-slate-500 font-medium">Verified ID: <span className="text-brand-600 font-black">{user?.id?.slice(0,8).toUpperCase()}</span></p>
           </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus size={20}/>} className="flex-1 md:flex-none px-10 shadow-brand-500/30">
            Submit New Lead
          </Button>
          <button 
            onClick={handleSignOut}
            className="p-3.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
            title="Terminate Session"
          >
            <LogOut size={22} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Referrals" count={leads.length} icon={<Users size={20}/>} color="blue" subtitle="Prospects Introduced" />
        <StatCard title="Active Builds" count={projects.filter(p => p.status !== 'completed').length} icon={<Target size={20}/>} color="brand" subtitle="Revenue in Delivery" />
        <StatCard title="Total Commissions" count={`$${earnings.toLocaleString()}`} icon={<DollarSign size={20}/>} color="green" subtitle="Authorized Payouts" />
      </div>

      {/* Tabbed Interface */}
      <div className="space-y-6">
        <div className="flex gap-4 border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('pipeline')}
            className={`pb-4 px-2 text-xs font-black uppercase tracking-widest relative transition-colors ${activeTab === 'pipeline' ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Engagement Pipeline
            {activeTab === 'pipeline' && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-600 rounded-t-full"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('assets')}
            className={`pb-4 px-2 text-xs font-black uppercase tracking-widest relative transition-colors ${activeTab === 'assets' ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Sales Enablement Hub
            {activeTab === 'assets' && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-600 rounded-t-full"></div>}
          </button>
        </div>

        {activeTab === 'pipeline' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card noPadding className="border-slate-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp size={16} className="text-brand-600"/> Referral Pipeline
                </h3>
                <button onClick={fetchPartnerData} className="text-slate-400 hover:text-brand-600 transition-all"><RefreshCw size={14}/></button>
              </div>
              <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto custom-scrollbar">
                {leads.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs font-bold uppercase">No referrals found.</div>
                ) : (
                  leads.map(lead => (
                    <div key={lead.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div>
                          <p className="font-black text-slate-900 text-sm">{lead.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{lead.service} • {new Date(lead.created_at).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={lead.status === 'new' ? 'info' : lead.status === 'closed' ? 'success' : 'warning'} className="uppercase font-black text-[9px] tracking-widest">
                        {lead.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card noPadding className="border-slate-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest flex items-center gap-2">
                  <Briefcase size={16} className="text-brand-600"/> Closed Acquisitions
                </h3>
              </div>
              <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto custom-scrollbar">
                {projects.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs font-bold uppercase">Deals pending closure.</div>
                ) : (
                  projects.map(p => (
                    <div key={p.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div>
                          <p className="font-black text-slate-900 text-sm">{p.title}</p>
                          <p className="text-[10px] text-brand-600 font-black uppercase">Commission: ${p.commission_amount.toLocaleString()}</p>
                        </div>
                        <Badge variant="success" className="uppercase font-black text-[9px] tracking-widest">{p.status}</Badge>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
             {agencyAssets.map((asset, i) => (
               <Card key={i} className="hover:border-brand-400 transition-all group relative overflow-hidden" noPadding>
                  <div className="p-6">
                    <div className={`${asset.color} mb-4 group-hover:scale-110 transition-transform`}>
                       <asset.icon size={32} strokeWidth={2.5} />
                    </div>
                    <h4 className="font-black text-slate-900 text-sm mb-1 leading-tight">{asset.title}</h4>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{asset.type} • {asset.size}</p>
                    <button className="mt-6 w-full py-2.5 bg-slate-50 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-brand-600 group-hover:text-white transition-all shadow-sm">
                      <Download size={14}/> Download Asset
                    </button>
                  </div>
                  {/* Decorative background number */}
                  <span className="absolute -bottom-4 -right-2 text-6xl font-black text-slate-50 group-hover:text-brand-50 transition-colors -z-0 select-none">
                    0{i+1}
                  </span>
               </Card>
             ))}
             
             <Card className="bg-brand-600 border-none flex flex-col justify-center items-center text-center p-8 md:col-span-2">
                <h4 className="text-white font-black text-xl mb-2">Need Custom Assets?</h4>
                <p className="text-brand-100 text-sm font-medium mb-6">If you need a specific pitch deck or co-branded collateral, reach out to the admin team.</p>
                <Button variant="secondary" className="w-full bg-white text-brand-600 hover:bg-brand-50 border-none shadow-xl">
                  Message Support
                </Button>
             </Card>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Client Referral">
         <div className="space-y-6">
            <Input label="Client/Org Name" value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} placeholder="Enterprise Corp" />
            <Input label="Direct Contact Email" type="email" value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})} placeholder="decision.maker@client.com" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Interest Area</label>
                 <select 
                   className="w-full p-3.5 border border-slate-200 rounded-xl outline-none font-bold text-slate-700 bg-white"
                   value={newLead.service}
                   onChange={e => setNewLead({...newLead, service: e.target.value})}
                 >
                    <option>Web Development</option>
                    <option>AI Automation</option>
                    <option>Branding</option>
                    <option>Custom SaaS</option>
                 </select>
              </div>
              <Input label="Est. Budget" value={newLead.budget} onChange={e => setNewLead({...newLead, budget: e.target.value})} placeholder="$10k+" />
            </div>
            <div>
               <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Context / Deal Specifics</label>
               <textarea 
                 className="w-full h-32 p-4 border rounded-xl outline-none font-medium text-slate-700 focus:border-brand-500" 
                 placeholder="How did you source this? What are they looking for?"
                 value={newLead.message}
                 onChange={e => setNewLead({...newLead, message: e.target.value})}
               />
            </div>
            <Button onClick={handleSubmitLead} className="w-full py-4 uppercase font-black" leftIcon={<Send size={20}/>}>Transmit to HQ</Button>
         </div>
      </Modal>
    </div>
  );
};

const StatCard = ({ title, count, icon, color, subtitle }: any) => (
  <Card className={`border-l-4 border-slate-200 ${color === 'blue' ? 'border-l-blue-500' : color === 'brand' ? 'border-l-brand-600' : 'border-l-green-500'}`}>
     <div className="flex justify-between items-start mb-4">
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{title}</p>
        <div className={`p-2 rounded-lg bg-slate-50 text-slate-400`}>{icon}</div>
     </div>
     <h3 className="text-3xl font-black text-slate-900">{count}</h3>
     <p className="text-[9px] font-black text-slate-500 uppercase mt-1">{subtitle}</p>
  </Card>
);

export default PartnerDashboard;
