
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Project } from '../../types';
import Button from '../Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
// Added Briefcase to the lucide-react import list
import { Loader2, Edit2, Trash2, Save, Plus, Share2, Copy, Check, Link as LinkIcon, Code2, FileText, Eye, EyeOff, User, Mail, Globe, AlertCircle, Briefcase } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const AdminProjects: React.FC = () => {
  const { success, error: showError } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  
  const [currentProject, setCurrentProject] = useState<Partial<Project>>({
    title: '',
    category: 'Web Development',
    image: 'https://picsum.photos/800/600',
    description: '',
    client: '',
    client_email: '',
    status: 'planning',
    is_portfolio: false,
    repo_link: '',
    documentation_link: '',
    live_link: '',
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
        is_portfolio: p.is_portfolio ?? false
      }));

      setProjects(mapped as Project[]);
    } catch (error: any) {
      console.error('Fetch error:', error);
      showError('Database error: Ensure the projects table exists and RLS is configured.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentProject.title || !currentProject.client) {
      showError('Title and Client Name are required');
      return;
    }

    const payload: any = {
      title: currentProject.title,
      category: currentProject.category,
      image: currentProject.image,
      description: currentProject.description,
      client: currentProject.client,
      client_email: currentProject.client_email,
      status: currentProject.status,
      is_portfolio: currentProject.is_portfolio,
      repo_link: currentProject.repo_link,
      documentation_link: currentProject.documentation_link,
      live_link: currentProject.live_link,
      tech_stack: currentProject.techStack || [],
      results: currentProject.results || []
    };

    try {
      if (currentProject.id) {
        const { error } = await supabase.from('projects').update(payload).eq('id', currentProject.id);
        if (error) throw error;
        success('Project successfully updated');
      } else {
        const { error } = await supabase.from('projects').insert([payload]);
        if (error) throw error;
        success('New project record created');
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (error: any) {
      showError(`Operation failed: ${error.message}. Check Supabase RLS policies.`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('PERMANENT ACTION: Are you sure you want to delete this project? This will remove all associated handover links and portal access.')) return;
    
    setDeletingId(id);
    try {
      const { error, count } = await supabase
        .from('projects')
        .delete({ count: 'exact' })
        .eq('id', id);
      
      if (error) throw error;
      
      // If count is 0, it means RLS likely blocked the delete even if the ID exists
      if (count === 0) {
        throw new Error('Permission denied or record not found. Check Supabase RLS policies.');
      }

      setProjects(prev => prev.filter(p => p.id !== id));
      success('Project record permanently deleted');
    } catch (error: any) {
      console.error('Delete error:', error);
      showError(`Delete failed: ${error.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleShare = (project: Project) => {
    setSelectedProject(project);
    setIsShareModalOpen(true);
  };

  const copyShareText = () => {
    if (!selectedProject) return;
    const text = `
🚀 *HyperBuild Labs - Project Handover Summary*

Project: *${selectedProject.title}*
Status: *${(selectedProject.status || 'planning').toUpperCase()}*

📦 *Handover Assets:*
🔗 Live: ${selectedProject.live_link || 'TBD'}
📂 Repo: ${selectedProject.repo_link || 'Internal Review'}
📖 Docs: ${selectedProject.documentation_link || 'In Drafting'}

📲 *Tracking Portal:*
${window.location.origin}/#/track
(Verify with Name: ${selectedProject.client} & Email: ${selectedProject.client_email})

---------------------------
_Built by HyperBuild Labs_
    `.trim();

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const clientProjects = projects.filter(p => !p.is_portfolio);
  const portfolioProjects = projects.filter(p => p.is_portfolio);

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-3xl border border-slate-200 shadow-sm gap-4">
        <div>
           <h2 className="text-2xl font-black text-slate-900 tracking-tight">Project Management Engine</h2>
           <p className="text-sm text-slate-500 font-medium">Control the visibility and delivery lifecycle of your engineering output.</p>
        </div>
        <Button 
          onClick={() => { 
            setCurrentProject({ title: '', status: 'planning', is_portfolio: false, techStack: [], results: [] }); 
            setIsModalOpen(true); 
          }} 
          leftIcon={<Plus size={20} />}
          className="shadow-xl shadow-brand-500/20"
        >
          Initiate New Project
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="animate-spin text-brand-600 w-12 h-12" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Synchronizing with Cloud...</p>
        </div>
      ) : (
        <>
          {/* Active Client Projects */}
          <section>
            <div className="flex items-center gap-4 mb-8">
              <Badge variant="info" className="uppercase font-black px-4 py-1.5 text-xs tracking-wider">Active Client Deliveries</Badge>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>
            {clientProjects.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="text-slate-300" size={32} />
                </div>
                <p className="text-slate-400 font-bold">No active client projects being tracked.</p>
                <p className="text-slate-300 text-sm mt-1">Start a project to enable client portal features.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {clientProjects.map(p => (
                  <ProjectEntryCard 
                    key={p.id} 
                    project={p} 
                    isDeleting={deletingId === p.id}
                    onEdit={() => { setCurrentProject(p); setIsModalOpen(true); }} 
                    onDelete={() => handleDelete(p.id)} 
                    onShare={() => handleShare(p)} 
                  />
                ))}
              </div>
            )}
          </section>

          {/* Public Portfolio Showcase */}
          <section>
            <div className="flex items-center gap-4 mb-8">
              <Badge variant="success" className="uppercase font-black px-4 py-1.5 text-xs tracking-wider">Public Portfolio Showcase</Badge>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>
            {portfolioProjects.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
                <p className="text-slate-400 font-bold">No projects marked as public.</p>
                <p className="text-slate-300 text-sm mt-1">Toggle "Display in Portfolio" to show projects on the home page.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-90 hover:opacity-100 transition-opacity">
                {portfolioProjects.map(p => (
                  <ProjectEntryCard 
                    key={p.id} 
                    project={p} 
                    isDeleting={deletingId === p.id}
                    onEdit={() => { setCurrentProject(p); setIsModalOpen(true); }} 
                    onDelete={() => handleDelete(p.id)} 
                    onShare={() => handleShare(p)} 
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* Main Management Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Configure Project Parameters" size="xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
           <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-2 h-2 bg-brand-500 rounded-full"></div>
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest">Business Context</h4>
              </div>
              <Input label="Project Official Title" value={currentProject.title} onChange={e => setCurrentProject({...currentProject, title: e.target.value})} placeholder="e.g. Enterprise CRM v2.0" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Client Identity" value={currentProject.client} onChange={e => setCurrentProject({...currentProject, client: e.target.value})} icon={<User size={14}/>} placeholder="Organization Name" />
                <Input label="Verification Email" value={currentProject.client_email} onChange={e => setCurrentProject({...currentProject, client_email: e.target.value})} icon={<Mail size={14}/>} placeholder="client@company.com" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Lifecycle Stage</label>
                <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 font-bold text-slate-700 transition-all appearance-none" value={currentProject.status} onChange={e => setCurrentProject({...currentProject, status: e.target.value as any})}>
                   <option value="planning">Phase 1: Strategic Discovery</option>
                   <option value="development">Phase 2: Active Engineering</option>
                   <option value="review">Phase 3: Quality Audit / Beta</option>
                   <option value="completed">Phase 4: Successful Handover</option>
                </select>
              </div>
              <div className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${currentProject.is_portfolio ? 'bg-brand-50 border-brand-200' : 'bg-slate-50 border-slate-200'}`}>
                 <input type="checkbox" id="isp" className="w-6 h-6 rounded-lg text-brand-600 focus:ring-brand-500 cursor-pointer" checked={currentProject.is_portfolio} onChange={e => setCurrentProject({...currentProject, is_portfolio: e.target.checked})} />
                 <label htmlFor="isp" className="flex-1 text-sm font-black text-slate-700 cursor-pointer">
                    Display in Public Portfolio Showcase
                    <span className="block text-[10px] font-medium text-slate-400 mt-0.5">Toggle this to make the project visible to anonymous visitors.</span>
                 </label>
              </div>
           </div>

           <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest">Handover Assets</h4>
              </div>
              <Input label="Git Repository Endpoint" value={currentProject.repo_link} onChange={e => setCurrentProject({...currentProject, repo_link: e.target.value})} icon={<Code2 size={14}/>} placeholder="https://github.com/org/repo" />
              <Input label="Technical Documentation" value={currentProject.documentation_link} onChange={e => setCurrentProject({...currentProject, documentation_link: e.target.value})} icon={<FileText size={14}/>} placeholder="Notion / Google Drive Link" />
              <Input label="Production Environment URL" value={currentProject.live_link} onChange={e => setCurrentProject({...currentProject, live_link: e.target.value})} icon={<Globe size={14}/>} placeholder="https://client-project.app" />
              <Input label="Visual Asset (Cover URL)" value={currentProject.image} onChange={e => setCurrentProject({...currentProject, image: e.target.value})} icon={<Eye size={14}/>} placeholder="CDN or External URL" />
           </div>
        </div>
        <div className="mt-10 pt-6 border-t flex justify-end gap-4">
           <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="font-bold">Discard Changes</Button>
           <Button onClick={handleSave} leftIcon={<Save size={20}/>} className="px-8 py-3.5">Commit Project Record</Button>
        </div>
      </Modal>

      {/* Share/Handover Modal */}
      <Modal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} title="Client Handover Generator">
         <div className="space-y-6">
            <div className="flex items-start gap-4 bg-blue-50 p-4 rounded-2xl border border-blue-100">
               <AlertCircle className="text-blue-500 flex-shrink-0" size={20} />
               <p className="text-xs text-blue-700 leading-relaxed font-medium">This professional summary includes all secure portal instructions and asset links. Optimized for instant delivery via business communication channels.</p>
            </div>
            <div className="bg-secondary-900 p-8 rounded-3xl border border-slate-700 font-mono text-[11px] text-brand-300 whitespace-pre-wrap leading-relaxed shadow-inner overflow-y-auto max-h-72">
{`🚀 HyperBuild Labs - Project Handover

Project: *${selectedProject?.title}*
Status: *${(selectedProject?.status || 'planning').toUpperCase()}*

📦 Access Details:
- Source Repo: ${selectedProject?.repo_link || 'Internal Review'}
- Documentation: ${selectedProject?.documentation_link || 'Preparing'}
- Live Staging: ${selectedProject?.live_link || 'Pending'}

📲 Secure Client Portal:
${window.location.origin}/#/track
(Login with your authorized Name & Email)

---------------------------
_Built with Precision by HyperBuild Labs_`}
            </div>
            <Button onClick={copyShareText} className="w-full py-5 shadow-2xl text-lg font-black" leftIcon={isCopied ? <Check size={24}/> : <Copy size={24}/>}>
              {isCopied ? 'Summary Copied!' : 'Copy Summary for Delivery'}
            </Button>
         </div>
      </Modal>
    </div>
  );
};

interface ProjectEntryCardProps {
  project: Project;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
}

const ProjectEntryCard: React.FC<ProjectEntryCardProps> = ({ project, isDeleting, onEdit, onDelete, onShare }) => (
  <Card className={`group overflow-hidden border-slate-200 hover:border-brand-400 hover:shadow-2xl transition-all duration-300 relative ${isDeleting ? 'opacity-50 grayscale pointer-events-none' : ''}`} noPadding>
    {isDeleting && (
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
        <Loader2 className="animate-spin text-red-600 mb-2" size={32} />
        <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Wiping Record...</span>
      </div>
    )}
    <div className="h-48 relative overflow-hidden bg-slate-100">
       <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
       <div className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
          <button onClick={onEdit} className="bg-white p-3.5 rounded-2xl text-brand-600 hover:scale-110 active:scale-95 transition-all shadow-xl" title="Edit Parameters"><Edit2 size={20}/></button>
          <button onClick={onShare} className="bg-white p-3.5 rounded-2xl text-blue-600 hover:scale-110 active:scale-95 transition-all shadow-xl" title="Generate Handover"><Share2 size={20}/></button>
          <button onClick={onDelete} className="bg-white p-3.5 rounded-2xl text-red-600 hover:scale-110 active:scale-95 transition-all shadow-xl" title="Permanent Delete"><Trash2 size={20}/></button>
       </div>
       <div className="absolute top-4 left-4 flex gap-2">
         <Badge variant="info" className="shadow-2xl uppercase font-black tracking-tight border-none bg-brand-600 text-white px-3 py-1">{project.status}</Badge>
         {project.is_portfolio ? (
            <Badge variant="success" className="shadow-2xl border-none font-black px-2"><Globe size={12} className="mr-1"/> Public</Badge> 
         ) : (
            <Badge variant="neutral" className="shadow-2xl border-none font-black px-2"><EyeOff size={12} className="mr-1"/> Private Tracking</Badge>
         )}
       </div>
    </div>
    <div className="p-6">
      <h3 className="font-black text-slate-900 truncate text-lg mb-1 leading-tight">{project.title}</h3>
      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-6 flex items-center gap-1.5">
        <User size={10} className="text-brand-500" /> {project.client || 'Internal Development'}
      </p>
      
      <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-50">
         <div className={`p-3 rounded-xl text-center flex flex-col items-center gap-1 transition-colors ${project.repo_link ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-200'}`} title="Git Repository Status">
            <Code2 size={18} />
            <span className="text-[8px] font-black uppercase">{project.repo_link ? 'Live' : 'Null'}</span>
         </div>
         <div className={`p-3 rounded-xl text-center flex flex-col items-center gap-1 transition-colors ${project.documentation_link ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-200'}`} title="Technical Docs Status">
            <FileText size={18} />
            <span className="text-[8px] font-black uppercase">{project.documentation_link ? 'Live' : 'Null'}</span>
         </div>
         <div className={`p-3 rounded-xl text-center flex flex-col items-center gap-1 transition-colors ${project.live_link ? 'bg-brand-50 text-brand-600' : 'bg-slate-50 text-slate-200'}`} title="Deployment Status">
            <LinkIcon size={18} />
            <span className="text-[8px] font-black uppercase">{project.live_link ? 'Prod' : 'Null'}</span>
         </div>
      </div>
    </div>
  </Card>
);

export default AdminProjects;
