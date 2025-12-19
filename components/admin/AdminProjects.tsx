
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
  FileText, CheckCircle, ShieldAlert, Power, Layout
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
        show_repo: p.show_repo ?? true,
        show_docs: p.show_docs ?? true,
        show_live: p.show_live ?? true,
        show_financials: p.show_financials ?? true,
        show_lifecycle: p.show_lifecycle ?? true
      }));

      setProjects(mapped as Project[]);
    } catch (error: any) {
      console.error('Fetch error:', error);
      showError('Sync failed. Ensure DB schema is updated with is_active.');
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
        success('Project persistent record updated');
      } else {
        const { error } = await supabase.from('projects').insert([payload]);
        if (error) throw error;
        success('New project engine initialized');
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (error: any) {
      showError(`Critical: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('IRREVERSIBLE: Wipe project from database?')) return;
    setDeletingId(id);
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      setProjects(prev => prev.filter(p => p.id !== id));
      success('Record purged');
    } catch (error: any) {
      showError('Deletion error');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleField = (field: keyof Project) => {
    setCurrentProject(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const clientProjects = projects.filter(p => !p.is_portfolio);
  const portfolioProjects = projects.filter(p => p.is_portfolio);

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-3xl border border-slate-200 shadow-sm gap-4">
        <div>
           <h2 className="text-2xl font-black text-slate-900 tracking-tight">Project Infrastructure</h2>
           <p className="text-sm text-slate-500 font-medium">Global status control and granular asset visibility.</p>
        </div>
        <Button onClick={() => { setCurrentProject({ title: '', status: 'planning', is_portfolio: false, is_active: true, show_repo: true, show_docs: true, show_live: true, show_financials: true, show_lifecycle: true, total_amount: 0, paid_amount: 0 }); setIsModalOpen(true); }} leftIcon={<Plus size={20} />}>
          Initiate Project
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

      {/* Modern High-Efficiency Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Configure Project Output" size="xl">
        {/* Global Visibility Header */}
        <div className={`mb-8 p-6 rounded-2xl border transition-all flex items-center justify-between ${currentProject.is_active ? 'bg-brand-50 border-brand-100' : 'bg-red-50 border-red-100'}`}>
           <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${currentProject.is_active ? 'bg-brand-600 text-white' : 'bg-red-600 text-white'}`}>
                 {currentProject.is_active ? <Power size={24} /> : <ShieldAlert size={24} />}
              </div>
              <div>
                 <h4 className={`text-lg font-black ${currentProject.is_active ? 'text-brand-900' : 'text-red-900'}`}>Global Master Toggle</h4>
                 <p className={`text-xs font-bold uppercase tracking-tight ${currentProject.is_active ? 'text-brand-600' : 'text-red-600'}`}>
                   {currentProject.is_active ? 'Project is visible to client & authorized parties' : 'Project is completely disabled (Dark Mode)'}
                 </p>
              </div>
           </div>
           <button 
             onClick={() => toggleField('is_active')}
             className={`px-6 py-2 rounded-xl font-black text-sm uppercase transition-all shadow-md ${currentProject.is_active ? 'bg-brand-600 text-white hover:bg-brand-700' : 'bg-red-600 text-white hover:bg-red-700'}`}
           >
             {currentProject.is_active ? 'DEACTIVATE' : 'ACTIVATE'}
           </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
           
           <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                 <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1"><User size={10}/> Client Identification</h5>
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-500">SHOW ON WEBSITE:</span>
                    <button onClick={() => toggleField('is_portfolio')} className={`p-1.5 rounded-lg transition-colors ${currentProject.is_portfolio ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-400'}`}>
                       {currentProject.is_portfolio ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                 </div>
              </div>
              <Input label="Internal Project Name" value={currentProject.title} onChange={e => setCurrentProject({...currentProject, title: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Client" value={currentProject.client} onChange={e => setCurrentProject({...currentProject, client: e.target.value})} icon={<User size={14}/>} />
                <Input label="Auth Email" value={currentProject.client_email} onChange={e => setCurrentProject({...currentProject, client_email: e.target.value})} icon={<Mail size={14}/>} />
              </div>
              
              <div className="pt-4">
                <div className="flex items-center justify-between mb-2">
                   <label className="text-sm font-black text-slate-700">Project Execution Phase</label>
                   <button onClick={() => toggleField('show_lifecycle')} className={`p-1 rounded-lg ${currentProject.show_lifecycle ? 'text-brand-600' : 'text-slate-300'}`}>
                     {currentProject.show_lifecycle ? <Eye size={16}/> : <EyeOff size={16}/>}
                   </button>
                </div>
                <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700" value={currentProject.status} onChange={e => setCurrentProject({...currentProject, status: e.target.value as any})}>
                   <option value="planning">Phase 1: Planning / Strategy</option>
                   <option value="development">Phase 2: Active Development</option>
                   <option value="review">Phase 3: QA / Security Audit</option>
                   <option value="completed">Phase 4: Production Handover</option>
                </select>
              </div>

              <div className="pt-6 space-y-4">
                 <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1"><DollarSign size={10}/> Financial Ledger</h5>
                    <button onClick={() => toggleField('show_financials')} className={`p-1 rounded-lg ${currentProject.show_financials ? 'text-brand-600' : 'text-slate-300'}`}>
                      {currentProject.show_financials ? <Eye size={16}/> : <EyeOff size={16}/>}
                    </button>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <Input label="Contract Value ($)" type="number" value={currentProject.total_amount} onChange={e => setCurrentProject({...currentProject, total_amount: Number(e.target.value)})} icon={<DollarSign size={14}/>} />
                    <Input label="Payment History ($)" type="number" value={currentProject.paid_amount} onChange={e => setCurrentProject({...currentProject, paid_amount: Number(e.target.value)})} icon={<Wallet size={14}/>} />
                 </div>
                 <div className="bg-secondary-900 p-5 rounded-2xl flex justify-between items-center text-white border border-slate-700 shadow-xl">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Balance Outstanding</span>
                    <span className="text-2xl font-black text-brand-400">${((currentProject.total_amount || 0) - (currentProject.paid_amount || 0)).toLocaleString()}</span>
                 </div>
              </div>
           </div>

           <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                 <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1"><Code2 size={10}/> Technical Delivery Endpoints</h5>
              </div>
              
              <div className="space-y-6">
                 <div className="group">
                    <div className="flex items-center justify-between mb-2">
                       <label className="text-xs font-black text-slate-500 uppercase tracking-tight">Source Repository</label>
                       <button onClick={() => toggleField('show_repo')} className={`p-1 rounded-lg transition-all ${currentProject.show_repo ? 'bg-brand-50 text-brand-600' : 'bg-slate-50 text-slate-300'}`}>
                          {currentProject.show_repo ? <Eye size={16} /> : <EyeOff size={16} />}
                       </button>
                    </div>
                    <Input value={currentProject.repo_link} onChange={e => setCurrentProject({...currentProject, repo_link: e.target.value})} icon={<Code2 size={14}/>} placeholder="Git Endpoint URL" />
                 </div>

                 <div className="group">
                    <div className="flex items-center justify-between mb-2">
                       <label className="text-xs font-black text-slate-500 uppercase tracking-tight">Live Preview Staging</label>
                       <button onClick={() => toggleField('show_live')} className={`p-1 rounded-lg transition-all ${currentProject.show_live ? 'bg-brand-50 text-brand-600' : 'bg-slate-50 text-slate-300'}`}>
                          {currentProject.show_live ? <Eye size={16} /> : <EyeOff size={16} />}
                       </button>
                    </div>
                    <Input value={currentProject.live_link} onChange={e => setCurrentProject({...currentProject, live_link: e.target.value})} icon={<Globe size={14}/>} placeholder="Staging URL" />
                 </div>

                 <div className="group">
                    <div className="flex items-center justify-between mb-2">
                       <label className="text-xs font-black text-slate-500 uppercase tracking-tight">Engineering Docs</label>
                       <button onClick={() => toggleField('show_docs')} className={`p-1 rounded-lg transition-all ${currentProject.show_docs ? 'bg-brand-50 text-brand-600' : 'bg-slate-50 text-slate-300'}`}>
                          {currentProject.show_docs ? <Eye size={16} /> : <EyeOff size={16} />}
                       </button>
                    </div>
                    <Input value={currentProject.documentation_link} onChange={e => setCurrentProject({...currentProject, documentation_link: e.target.value})} icon={<FileText size={14}/>} placeholder="Technical Handover URL" />
                 </div>
              </div>

              <div className="pt-6 border-t border-slate-50">
                 <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Project Banner Image</label>
                 <Input value={currentProject.image} onChange={e => setCurrentProject({...currentProject, image: e.target.value})} icon={<Layout size={14}/>} placeholder="Visual Reference URL" />
              </div>
           </div>
        </div>
        
        <div className="mt-10 pt-6 border-t flex justify-end gap-3">
           <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Discard Session</Button>
           <Button onClick={handleSave} leftIcon={<Save size={18}/>} className="px-8 shadow-xl shadow-brand-500/20">Commit Project Version</Button>
        </div>
      </Modal>
    </div>
  );
};

const ProjectEntryCard: React.FC<{ project: Project; isDeleting: boolean; onEdit: () => void; onDelete: () => void }> = ({ project, isDeleting, onEdit, onDelete }) => (
  <Card className={`group overflow-hidden border-slate-200 transition-all duration-300 relative ${isDeleting ? 'opacity-50 grayscale pointer-events-none' : ''} ${!project.is_active ? 'bg-slate-50 grayscale' : 'hover:border-brand-400 hover:shadow-2xl'}`} noPadding>
    <div className="h-40 relative overflow-hidden bg-slate-100">
       <img src={project.image} alt={project.title} className={`w-full h-full object-cover transition-opacity ${!project.is_active ? 'opacity-40' : ''}`} />
       <div className="absolute inset-0 bg-secondary-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
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
         <span className="text-brand-600 font-black">${project.total_amount.toLocaleString()}</span>
      </div>
      
      <div className="grid grid-cols-5 gap-1.5 pt-4 border-t border-slate-50">
         {[
           { icon: Code2, active: project.show_repo, tip: 'Repo' },
           { icon: Globe, active: project.show_live, tip: 'Live' },
           { icon: FileText, active: project.show_docs, tip: 'Docs' },
           { icon: DollarSign, active: project.show_financials, tip: 'Ledger' },
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
