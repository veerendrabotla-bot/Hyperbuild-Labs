
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Project } from '../../types';
import Button from '../Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import { 
  Loader2, Edit2, Trash2, Save, Plus, Eye, EyeOff, User, 
  Mail, Globe, AlertCircle, DollarSign, Wallet, Code2, 
  FileText, CheckCircle, ShieldAlert, Power, Layout, IndianRupee,
  Search as SearchIcon, Hammer, ShieldCheck, Flag
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const AdminProjects: React.FC = () => {
  const { success, error: showError } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [currentProject, setCurrentProject] = useState<Partial<Project>>({
    title: '',
    category: 'Web Development',
    image: 'https://picsum.photos/800/600',
    description: '',
    client: '',
    client_email: '',
    status: 'planning',
    is_portfolio: true,
    is_active: true,
    repo_link: '',
    documentation_link: '',
    live_link: '',
    total_amount: 0,
    paid_amount: 0,
    currency: 'USD',
    show_repo: true,
    show_docs: true,
    show_live: true,
    show_financials: true,
    show_lifecycle: true,
    techStack: [],
    results: []
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const mapped = (data || []).map((p: any) => ({
        ...p,
        techStack: p.tech_stack || [],
        results: p.results || [],
        status: p.status || 'planning',
        is_portfolio: p.is_portfolio ?? false,
        is_active: p.is_active ?? true,
        total_amount: p.total_amount || 0,
        paid_amount: p.paid_amount || 0,
        currency: p.currency || 'USD',
        show_repo: p.show_repo ?? true,
        show_docs: p.show_docs ?? true,
        show_live: p.show_live ?? true,
        show_financials: p.show_financials ?? true,
        show_lifecycle: p.show_lifecycle ?? true
      }));

      setProjects(mapped as Project[]);
    } catch (error: any) {
      console.error('Fetch error:', error);
      showError('Database sync failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentProject.title || !currentProject.client) {
      showError('Title and Client Name are required');
      return;
    }

    const payload = {
      title: currentProject.title,
      category: currentProject.category,
      image: currentProject.image,
      description: currentProject.description,
      client: currentProject.client,
      client_email: currentProject.client_email,
      status: currentProject.status,
      is_portfolio: currentProject.is_portfolio,
      is_active: currentProject.is_active,
      repo_link: currentProject.repo_link,
      documentation_link: currentProject.documentation_link,
      live_link: currentProject.live_link,
      tech_stack: currentProject.techStack || [],
      results: currentProject.results || [],
      total_amount: currentProject.total_amount || 0,
      paid_amount: currentProject.paid_amount || 0,
      currency: currentProject.currency || 'USD',
      show_repo: currentProject.show_repo,
      show_docs: currentProject.show_docs,
      show_live: currentProject.show_live,
      show_financials: currentProject.show_financials,
      show_lifecycle: currentProject.show_lifecycle
    };

    try {
      if (currentProject.id) {
        const { error } = await supabase.from('projects').update(payload).eq('id', currentProject.id);
        if (error) throw error;
        success('Project record updated');
      } else {
        const { error } = await supabase.from('projects').insert([payload]);
        if (error) throw error;
        success('New project initialized');
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (error: any) {
      showError(`Error: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('IRREVERSIBLE: Delete project data?')) return;
    setDeletingId(id);
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      setProjects(prev => prev.filter(p => p.id !== id));
      success('Purged successfully');
    } catch (error: any) {
      showError('Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleField = (field: keyof Project) => {
    setCurrentProject(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const phases = [
    { id: 'planning', label: 'Planning', icon: SearchIcon, desc: 'Strategy & Scoping' },
    { id: 'development', label: 'Development', icon: Hammer, desc: 'Active Engineering' },
    { id: 'review', label: 'Review', icon: ShieldCheck, desc: 'Audit & QA' },
    { id: 'completed', label: 'Completed', icon: Flag, desc: 'Handover & Close' },
  ];

  const clientProjects = projects.filter(p => !p.is_portfolio);
  const portfolioProjects = projects.filter(p => p.is_portfolio);

  const getCurrencySymbol = (cur: string | undefined) => cur === 'INR' ? '₹' : '$';

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-3xl border border-slate-200 shadow-sm gap-4">
        <div>
           <h2 className="text-2xl font-black text-slate-900 tracking-tight">Project Management</h2>
           <p className="text-sm text-slate-500 font-medium">Control visibility, delivery status, and financial ledgers.</p>
        </div>
        <Button onClick={() => { setCurrentProject({ title: '', status: 'planning', is_portfolio: false, is_active: true, show_repo: true, show_docs: true, show_live: true, show_financials: true, show_lifecycle: true, total_amount: 0, paid_amount: 0, currency: 'USD' }); setIsModalOpen(true); }} leftIcon={<Plus size={20} />}>
          Initiate New Project
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-600 w-10 h-10" /></div>
      ) : (
        <>
          <section>
            <div className="flex items-center gap-4 mb-6">
              <Badge variant="info" className="uppercase font-black px-4 py-1.5 text-[10px] tracking-widest">Active Client Builds</Badge>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {clientProjects.map(p => <ProjectEntryCard key={p.id} project={p} isDeleting={deletingId === p.id} onEdit={() => { setCurrentProject(p); setIsModalOpen(true); }} onDelete={() => handleDelete(p.id)} />)}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-4 mb-6">
              <Badge variant="success" className="uppercase font-black px-4 py-1.5 text-[10px] tracking-widest">Public Project Showcase</Badge>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {portfolioProjects.map(p => <ProjectEntryCard key={p.id} project={p} isDeleting={deletingId === p.id} onEdit={() => { setCurrentProject(p); setIsModalOpen(true); }} onDelete={() => handleDelete(p.id)} />)}
            </div>
          </section>
        </>
      )}

      {/* Configuration Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Configure Project" size="xl">
        {/* Global Access Switch */}
        <div className={`mb-8 p-6 rounded-2xl border transition-all flex items-center justify-between ${currentProject.is_active ? 'bg-brand-50 border-brand-100' : 'bg-red-50 border-red-100'}`}>
           <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${currentProject.is_active ? 'bg-brand-600 text-white' : 'bg-red-600 text-white'}`}>
                 {currentProject.is_active ? <CheckCircle size={24} /> : <Power size={24} />}
              </div>
              <div>
                 <h4 className={`text-lg font-black ${currentProject.is_active ? 'text-brand-900' : 'text-red-900'}`}>Global Visibility Switch</h4>
                 <p className={`text-xs font-bold uppercase ${currentProject.is_active ? 'text-brand-600' : 'text-red-600'}`}>
                   {currentProject.is_active ? 'Visible to client and authorized systems' : 'Project hidden from all public and client endpoints'}
                 </p>
              </div>
           </div>
           <button 
             onClick={() => toggleField('is_active')}
             className={`px-6 py-2 rounded-xl font-black text-xs uppercase transition-all shadow-md ${currentProject.is_active ? 'bg-brand-600 text-white hover:bg-brand-700' : 'bg-red-600 text-white hover:bg-red-700'}`}
           >
             {currentProject.is_active ? 'ACTIVE' : 'INACTIVE'}
           </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Column 1: Context & Lifecycle */}
           <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                 <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Project Identity</h5>
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-500">PORTFOLIO:</span>
                    <button onClick={() => toggleField('is_portfolio')} className={`p-1 rounded transition-colors ${currentProject.is_portfolio ? 'text-brand-600' : 'text-slate-300'}`}>
                       {currentProject.is_portfolio ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                 </div>
              </div>
              <Input label="Project Name" value={currentProject.title} onChange={e => setCurrentProject({...currentProject, title: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Client" value={currentProject.client} onChange={e => setCurrentProject({...currentProject, client: e.target.value})} icon={<User size={14}/>} />
                <Input label="Auth Email" value={currentProject.client_email} onChange={e => setCurrentProject({...currentProject, client_email: e.target.value})} icon={<Mail size={14}/>} />
              </div>
              
              {/* V2 Project Execution Phase - Visual Status Bar */}
              <div className="pt-4">
                <div className="flex items-center justify-between mb-4">
                   <label className="text-sm font-black text-slate-700 uppercase tracking-widest text-[10px]">Active Execution Phase</label>
                   <button onClick={() => toggleField('show_lifecycle')} className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-black uppercase transition-all ${currentProject.show_lifecycle ? 'bg-brand-50 text-brand-600' : 'bg-slate-50 text-slate-400'}`}>
                     {currentProject.show_lifecycle ? <><Eye size={12}/> Client Visible</> : <><EyeOff size={12}/> Hidden</>}
                   </button>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  {phases.map((phase) => {
                    const isActive = currentProject.status === phase.id;
                    const phaseIndex = phases.findIndex(p => p.id === phase.id);
                    const currentIndex = phases.findIndex(p => p.id === currentProject.status);
                    const isCompleted = phaseIndex < currentIndex;

                    return (
                      <button 
                        key={phase.id}
                        onClick={() => setCurrentProject({...currentProject, status: phase.id as any})}
                        className={`group relative flex flex-col items-center p-3 rounded-xl border transition-all duration-300 ${
                          isActive 
                            ? 'bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-200' 
                            : isCompleted 
                            ? 'bg-brand-50 border-brand-100 text-brand-600' 
                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                        }`}
                      >
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 transition-transform duration-500 ${isActive ? 'bg-white/20 scale-110' : isCompleted ? 'bg-brand-100' : 'bg-slate-50'}`}>
                            {isCompleted ? <CheckCircle size={16} strokeWidth={3} /> : <phase.icon size={16} strokeWidth={isActive ? 3 : 2} />}
                         </div>
                         <span className="text-[9px] font-black uppercase tracking-tighter text-center leading-none">{phase.label}</span>
                         {isActive && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-ping"></div>}
                      </button>
                    )
                  })}
                </div>
                <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3">
                   <div className="p-1.5 bg-white rounded-lg text-brand-600 shadow-sm"><FileText size={12}/></div>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                     Phase Definition: <span className="text-slate-700">{phases.find(p => p.id === currentProject.status)?.desc}</span>
                   </p>
                </div>
              </div>

              {/* Financial Ledger */}
              <div className="pt-6 space-y-4">
                 <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1"><DollarSign size={10}/> Financial Ledger</h5>
                    <div className="flex items-center gap-3">
                      <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button onClick={() => setCurrentProject({...currentProject, currency: 'USD'})} className={`px-2 py-0.5 text-[10px] font-black rounded ${currentProject.currency === 'USD' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400'}`}>USD</button>
                        <button onClick={() => setCurrentProject({...currentProject, currency: 'INR'})} className={`px-2 py-0.5 text-[10px] font-black rounded ${currentProject.currency === 'INR' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400'}`}>INR</button>
                      </div>
                      <button onClick={() => toggleField('show_financials')} className={`p-1 rounded transition-colors ${currentProject.show_financials ? 'text-brand-600' : 'text-slate-300'}`}>
                        {currentProject.show_financials ? <Eye size={16}/> : <EyeOff size={16}/>}
                      </button>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <Input label={`Total Contract`} type="number" value={currentProject.total_amount} onChange={e => setCurrentProject({...currentProject, total_amount: Number(e.target.value)})} icon={currentProject.currency === 'INR' ? <IndianRupee size={14}/> : <DollarSign size={14}/>} />
                    <Input label={`Paid to Date`} type="number" value={currentProject.paid_amount} onChange={e => setCurrentProject({...currentProject, paid_amount: Number(e.target.value)})} icon={currentProject.currency === 'INR' ? <IndianRupee size={14}/> : <Wallet size={14}/>} />
                 </div>
              </div>
           </div>

           {/* Column 2: Digital Assets */}
           <div className="space-y-6">
              <div className="border-b border-slate-100 pb-2">
                 <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Engineering Assets</h5>
              </div>
              
              <div className="space-y-6">
                 <div className="group">
                    <div className="flex items-center justify-between mb-2">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1.5"><Code2 size={12}/> Repository Endpoint</label>
                       <button onClick={() => toggleField('show_repo')} className={`p-1 rounded transition-colors ${currentProject.show_repo ? 'text-brand-600' : 'text-slate-300'}`}>
                          {currentProject.show_repo ? <Eye size={16} /> : <EyeOff size={16} />}
                       </button>
                    </div>
                    <Input value={currentProject.repo_link} onChange={e => setCurrentProject({...currentProject, repo_link: e.target.value})} placeholder="https://github.com/..." />
                 </div>

                 <div className="group">
                    <div className="flex items-center justify-between mb-2">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1.5"><Globe size={12}/> Live Preview / Staging</label>
                       <button onClick={() => toggleField('show_live')} className={`p-1 rounded transition-colors ${currentProject.show_live ? 'text-brand-600' : 'text-slate-300'}`}>
                          {currentProject.show_live ? <Eye size={16} /> : <EyeOff size={16} />}
                       </button>
                    </div>
                    <Input value={currentProject.live_link} onChange={e => setCurrentProject({...currentProject, live_link: e.target.value})} placeholder="https://staging.agency.com/..." />
                 </div>

                 <div className="group">
                    <div className="flex items-center justify-between mb-2">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1.5"><FileText size={12}/> Engineering Documentation</label>
                       <button onClick={() => toggleField('show_docs')} className={`p-1 rounded transition-colors ${currentProject.show_docs ? 'text-brand-600' : 'text-slate-300'}`}>
                          {currentProject.show_docs ? <Eye size={16} /> : <EyeOff size={16} />}
                       </button>
                    </div>
                    <Input value={currentProject.documentation_link} onChange={e => setCurrentProject({...currentProject, documentation_link: e.target.value})} placeholder="Notion / Google Drive Link" />
                 </div>
              </div>

              <div className="pt-6 border-t border-slate-50">
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Project Showcase Image URL</label>
                 <Input value={currentProject.image} onChange={e => setCurrentProject({...currentProject, image: e.target.value})} icon={<Layout size={14}/>} placeholder="Picsum or CDN URL" />
              </div>
           </div>
        </div>
        <div className="mt-10 pt-6 border-t flex justify-end gap-3">
           <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Discard</Button>
           <Button onClick={handleSave} leftIcon={<Save size={18}/>} className="px-8 shadow-xl shadow-brand-500/20">Commit Changes</Button>
        </div>
      </Modal>
    </div>
  );
};

const ProjectEntryCard: React.FC<{ project: Project; isDeleting: boolean; onEdit: () => void; onDelete: () => void }> = ({ project, isDeleting, onEdit, onDelete }) => (
  <Card className={`group overflow-hidden border-slate-200 transition-all duration-300 relative ${isDeleting ? 'opacity-50 grayscale pointer-events-none' : ''} ${!project.is_active ? 'bg-slate-50 grayscale' : 'hover:border-brand-400 hover:shadow-2xl'}`} noPadding>
    <div className="h-40 relative overflow-hidden bg-slate-100">
       <img src={project.image} alt={project.title} className={`w-full h-full object-cover transition-opacity ${!project.is_active ? 'opacity-30' : ''}`} />
       <div className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button onClick={onEdit} className="bg-white p-3 rounded-xl text-brand-600 hover:scale-110 active:scale-95 transition-all shadow-xl"><Edit2 size={20}/></button>
          <button onClick={onDelete} className="bg-white p-3 rounded-xl text-red-600 hover:scale-110 active:scale-95 transition-all shadow-xl"><Trash2 size={20}/></button>
       </div>
       <div className="absolute top-3 left-3 flex gap-2">
         <Badge variant={!project.is_active ? 'neutral' : 'info'} className="uppercase font-black text-[9px] tracking-widest border-none bg-brand-600 text-white shadow-lg">
           {!project.is_active ? 'OFFLINE' : project.status}
         </Badge>
       </div>
       {!project.is_active && (
         <div className="absolute top-3 right-3 p-1.5 bg-red-600 rounded-lg text-white shadow-lg">
           <ShieldAlert size={14} />
         </div>
       )}
    </div>
    <div className="p-6">
      <h3 className={`font-black truncate mb-1 text-lg ${!project.is_active ? 'text-slate-400' : 'text-slate-900'}`}>{project.title}</h3>
      <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 mb-6">
         <span className="flex items-center gap-1 truncate max-w-[60%]"><User size={10} className="text-brand-500" /> {project.client}</span>
         <span className="text-brand-600 font-black">{project.currency === 'INR' ? '₹' : '$'}{project.total_amount.toLocaleString()}</span>
      </div>
      
      <div className="grid grid-cols-5 gap-1.5 pt-4 border-t border-slate-50">
         {[
           { icon: Code2, active: project.show_repo, tip: 'Repo' },
           { icon: Globe, active: project.show_live, tip: 'Live' },
           { icon: FileText, active: project.show_docs, tip: 'Docs' },
           { icon: DollarSign, active: project.show_financials, tip: 'Cash' },
           { icon: CheckCircle, active: project.show_lifecycle, tip: 'Flow' }
         ].map((item, i) => (
           <div key={i} className={`p-2 rounded flex justify-center transition-all ${item.active ? 'bg-brand-50 text-brand-600 border border-brand-100' : 'bg-slate-50 text-slate-200 border border-slate-100'}`} title={item.tip}>
              <item.icon size={14} strokeWidth={item.active ? 3 : 2} />
           </div>
         ))}
      </div>
    </div>
  </Card>
);

export default AdminProjects;
