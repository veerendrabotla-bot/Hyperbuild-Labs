
import React, { useState } from 'react';
import SEO from '../components/SEO';
import SectionHeading from '../components/SectionHeading';
import Button from '../components/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { 
  Search, Loader2, Code2, ExternalLink, 
  CheckCircle2, Globe, Lock, 
  Receipt, ArrowLeft, ShieldAlert,
  FolderKanban, Briefcase, ChevronRight,
  Clock, ShieldCheck, Flag, Hammer
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Project } from '../types';
import { useToast } from '../contexts/ToastContext';

const TrackProject: React.FC = () => {
  const { error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [clientName, setClientName] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [hasVerified, setHasVerified] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !clientName) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .ilike('client', clientName)
        .ilike('client_email', email)
        .eq('is_active', true) // Only show active projects
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        showError('No active projects found for these credentials.');
      } else {
        setProjects(data as Project[]);
        setHasVerified(true);
        // If only one project, select it automatically
        if (data.length === 1) {
          setSelectedProject(data[0] as Project);
        }
      }
    } catch (err) {
      showError('Authentication failed. Check your organization name and email.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: string | undefined) => {
    if (!status) return 1;
    switch(status.toLowerCase()) {
      case 'planning': return 1;
      case 'development': return 2;
      case 'review': return 3;
      case 'completed': return 4;
      default: return 1;
    }
  };

  const getCurrencySymbol = (cur: string | undefined) => cur === 'INR' ? '₹' : '$';

  // --- Render Views ---

  // 1. Initial Login
  if (!hasVerified) {
    return (
      <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
        <SEO title="Project Delivery Hub" description="Real-time transparency into your enterprise project deliverables." />
        <div className="max-w-4xl mx-auto px-4">
          <SectionHeading 
            title="Project Execution Hub" 
            subtitle="Access real-time oversight into infrastructure, assets, and milestones."
          />
          <Card className="max-w-md mx-auto shadow-2xl border-slate-200 p-8">
            <form onSubmit={handleTrack} className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-100">
                  <Lock size={32} className="text-brand-600" />
                </div>
                <h4 className="font-black text-slate-900 text-lg uppercase tracking-tight">Client Verification</h4>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Authorized Agency Endpoints Only</p>
              </div>
              <Input label="Organization / Client Name" placeholder="As per contract" value={clientName} onChange={e => setClientName(e.target.value)} required />
              <Input label="Authorized Email" placeholder="finance@yourcompany.com" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              <Button type="submit" className="w-full py-4 text-lg font-black shadow-xl shadow-brand-500/20" isLoading={loading} leftIcon={<Search size={18}/>}>Verify Identity</Button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  // 2. Project Selection Directory (If multiple projects)
  if (hasVerified && !selectedProject) {
    return (
      <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
             <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Active Engagements</h2>
                <p className="text-slate-500 font-medium mt-1">Select a project to view the engineering stream.</p>
             </div>
             <button 
               onClick={() => setHasVerified(false)} 
               className="flex items-center text-xs font-black text-slate-400 hover:text-brand-600 uppercase tracking-widest transition-all"
             >
               <ArrowLeft size={14} className="mr-2" /> Log Out
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            {projects.map(p => (
              <button 
                key={p.id} 
                onClick={() => setSelectedProject(p)}
                className="group flex items-center text-left bg-white p-6 rounded-3xl border border-slate-200 hover:border-brand-500 hover:shadow-2xl transition-all duration-300"
              >
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors mr-6">
                   <FolderKanban size={28} />
                </div>
                <div className="flex-1 min-w-0">
                   <h3 className="font-black text-slate-900 text-lg truncate">{p.title}</h3>
                   <div className="flex items-center gap-3 mt-1">
                      <Badge variant="info" className="uppercase text-[9px] tracking-widest">{p.status}</Badge>
                      <span className="text-[10px] font-black text-slate-400 uppercase">ID: {p.id.slice(0, 8)}</span>
                   </div>
                </div>
                <ChevronRight size={20} className="text-slate-200 group-hover:text-brand-600 group-hover:translate-x-1 transition-all ml-4" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. Specific Project View
  const phases = [
    { id: 'planning', label: 'Strategy', icon: Clock },
    { id: 'development', label: 'Engineering', icon: Hammer },
    { id: 'review', label: 'QA / Audit', icon: ShieldCheck },
    { id: 'completed', label: 'Handover', icon: Flag }
  ];

  return (
    <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
      <SEO title={`${selectedProject?.title} | Delivery`} description="Real-time project tracking" />
      <div className="max-w-5xl mx-auto px-4">
        
        {/* Navigation / Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-3xl border border-slate-200 shadow-xl gap-4 mb-8">
           <div className="flex items-center gap-6">
              {projects.length > 1 && (
                <button 
                  onClick={() => setSelectedProject(null)} 
                  className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 text-slate-400 hover:text-brand-600 transition-all border border-slate-100"
                  title="Return to directory"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <div>
                 <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">{selectedProject?.title}</h2>
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mt-1.5 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                   Authenticated Stream — {selectedProject?.client}
                 </p>
              </div>
           </div>
           {selectedProject?.show_lifecycle && (
             <Badge variant={selectedProject.status === 'completed' ? 'success' : 'info'} className="text-sm py-2 px-8 shadow-lg uppercase font-black tracking-tight border-none bg-brand-600 text-white">
               {selectedProject.status}
             </Badge>
           )}
        </div>

        {/* Financial Ledger */}
        {selectedProject?.show_financials && (
          <Card className="p-10 bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden mb-8">
             <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
             <div className="flex items-center gap-3 mb-10 relative z-10">
                <div className="p-2.5 bg-white/10 rounded-xl text-brand-400 border border-white/5">
                  <Receipt size={24} />
                </div>
                <h3 className="font-black uppercase tracking-widest text-[11px]">Financial Performance Index</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10 relative z-10">
                <div>
                   <p className="text-[10px] text-slate-400 font-black uppercase mb-2 tracking-widest">Contract Value</p>
                   <p className="text-3xl font-black text-white">{getCurrencySymbol(selectedProject.currency)}{selectedProject.total_amount.toLocaleString()}</p>
                </div>
                <div>
                   <p className="text-[10px] text-brand-400 font-black uppercase mb-2 tracking-widest">Amount Cleared</p>
                   <p className="text-3xl font-black text-brand-400">{getCurrencySymbol(selectedProject.currency)}{selectedProject.paid_amount.toLocaleString()}</p>
                </div>
                <div>
                   <p className="text-[10px] text-red-400 font-black uppercase mb-2 tracking-widest">Outstanding</p>
                   <p className="text-3xl font-black text-red-400">{getCurrencySymbol(selectedProject.currency)}{(selectedProject.total_amount - selectedProject.paid_amount).toLocaleString()}</p>
                </div>
             </div>
             
             <div className="space-y-3 relative z-10 bg-white/5 p-6 rounded-2xl border border-white/10">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                   <span className="text-slate-400">Payment Milestone Completion</span>
                   <span className="text-brand-400">{Math.round((selectedProject.paid_amount / selectedProject.total_amount) * 100) || 0}%</span>
                </div>
                <div className="h-4 bg-white/5 rounded-full overflow-hidden p-1 border border-white/10">
                   <div 
                     className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-1000" 
                     style={{ width: `${(selectedProject.paid_amount / selectedProject.total_amount) * 100}%` }}
                   />
                </div>
             </div>
          </Card>
        )}

        {/* Lifecycle Timeline */}
        {selectedProject?.show_lifecycle && (
          <Card className="p-10 border-slate-200 mb-8">
            <div className="flex items-center justify-between mb-12">
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-[11px]">Engineering Milestone Tracking</h3>
              <Badge variant="neutral" className="font-black px-4 py-1.5 text-[10px]">PHASE {getStatusStep(selectedProject.status)} / 4</Badge>
            </div>
            <div className="relative flex flex-col md:flex-row justify-between gap-10">
                {phases.map((step, idx) => {
                  const currentStep = getStatusStep(selectedProject.status);
                  const isDone = (idx + 1) < currentStep || selectedProject.status === 'completed';
                  const isCurrent = (idx + 1) === currentStep;

                  return (
                    <div key={step.id} className="flex-1 flex flex-row md:flex-col items-center text-center gap-5 relative z-10">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl ${
                        isDone ? 'bg-green-500 text-white' : 
                        isCurrent ? 'bg-brand-600 text-white ring-8 ring-brand-50 scale-110' : 
                        'bg-slate-50 text-slate-300 border border-slate-100'
                      }`}>
                        {isDone ? <CheckCircle2 size={28}/> : <step.icon size={24} strokeWidth={isCurrent ? 3 : 2} />}
                      </div>
                      <div className="flex flex-col items-start md:items-center">
                        <span className={`text-[11px] font-black uppercase tracking-widest ${isCurrent ? 'text-brand-600' : isDone ? 'text-green-600' : 'text-slate-400'}`}>
                          {step.label}
                        </span>
                        {isCurrent && <span className="text-[9px] font-black text-brand-400 uppercase animate-pulse mt-1">Active</span>}
                      </div>
                    </div>
                  );
                })}
                {/* Horizontal Progress Bar */}
                <div className="hidden md:block absolute top-7 left-0 w-full h-1.5 bg-slate-100 -z-0 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-brand-500 transition-all duration-1000" 
                     style={{ width: `${((getStatusStep(selectedProject.status) - 1) / 3) * 100}%` }}
                   />
                </div>
            </div>
          </Card>
        )}

        {/* Assets Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {selectedProject?.show_repo && (
             <Card className="flex flex-col h-full hover:border-brand-400 transition-all p-10 border-slate-200 group">
                <div className="bg-slate-900 w-16 h-16 rounded-2xl flex items-center justify-center text-brand-400 mb-8 shadow-2xl group-hover:scale-110 transition-transform">
                  <Code2 size={32} />
                </div>
                <h4 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Engineering Hub</h4>
                <p className="text-sm text-slate-500 mb-10 leading-relaxed font-medium">Direct secure endpoint to the primary technical environment and code repository.</p>
                {selectedProject.repo_link ? (
                  <a href={selectedProject.repo_link} target="_blank" rel="noopener noreferrer" className="mt-auto">
                    <Button variant="outline" className="w-full py-5 font-black text-[11px] uppercase tracking-widest border-2" rightIcon={<ExternalLink size={18}/>}>Request Access</Button>
                  </a>
                ) : (
                  <div className="mt-auto p-5 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Environment provision in progress</div>
                )}
             </Card>
           )}

           {selectedProject?.show_live && (
             <Card className="flex flex-col h-full hover:border-brand-400 transition-all p-10 border-slate-200 group">
                <div className="bg-brand-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-8 shadow-2xl group-hover:scale-110 transition-transform">
                  <Globe size={32} />
                </div>
                <h4 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Staging Preview</h4>
                <p className="text-sm text-slate-500 mb-10 leading-relaxed font-medium">Observe real-time interface iterations and active production builds.</p>
                {selectedProject.live_link ? (
                  <a href={selectedProject.live_link} target="_blank" rel="noopener noreferrer" className="mt-auto">
                    <Button variant="primary" className="w-full py-5 font-black text-[11px] uppercase tracking-widest shadow-xl shadow-brand-500/30" rightIcon={<ExternalLink size={18}/>}>Launch Environment</Button>
                  </a>
                ) : (
                  <div className="mt-auto p-5 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Deployment scheduled</div>
                )}
             </Card>
           )}
        </div>

        <div className="text-center pt-16">
           <button 
             onClick={() => { setSelectedProject(null); setHasVerified(false); }} 
             className="group text-slate-400 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center mx-auto border border-slate-200 px-8 py-3 rounded-full hover:bg-white hover:shadow-md"
           >
             <ShieldAlert size={12} className="mr-2" /> Terminate Secure Session
           </button>
        </div>
      </div>
    </div>
  );
};

export default TrackProject;
