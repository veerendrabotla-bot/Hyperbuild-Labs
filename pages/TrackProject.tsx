
import React, { useState } from 'react';
import SEO from '../components/SEO';
import SectionHeading from '../components/SectionHeading';
import Button from '../components/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { 
  Search, Loader2, Code2, FileText, ExternalLink, 
  CheckCircle2, Layout, ArrowRight, Globe, Lock, 
  DollarSign, Receipt, CreditCard, ChevronRight, Wallet, ShieldAlert
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Project } from '../types';
import { useToast } from '../contexts/ToastContext';

const TrackProject: React.FC = () => {
  const { error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [clientName, setClientName] = useState('');
  const [project, setProject] = useState<Project | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !clientName) return;

    setLoading(true);
    setProject(null);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .ilike('client', clientName)
        .ilike('client_email', email)
        .eq('is_active', true) // CRITICAL: Verify the project is not globally disabled
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        showError('Access Denied. Ensure the project is active and credentials are correct.');
      } else if (data) {
        setProject(data as Project);
      }
    } catch (err) {
      showError('Authentication failed. Ensure project accessibility.');
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

  return (
    <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
      <SEO title="Project Delivery Hub" description="Real-time transparency into your enterprise project deliverables." />
      
      <div className="max-w-4xl mx-auto px-4">
        <SectionHeading 
          title="Project Execution Hub" 
          subtitle="Real-time oversight into infrastructure, assets, and milestones."
        />

        {!project ? (
          <Card className="max-w-md mx-auto shadow-2xl border-brand-100 p-8">
            <form onSubmit={handleTrack} className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-100">
                  <Lock size={32} className="text-brand-600" />
                </div>
                <h4 className="font-black text-slate-900 text-lg">Identity Verification</h4>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Authenticate delivery credentials</p>
              </div>
              <Input label="Client Name" placeholder="Organization name" value={clientName} onChange={e => setClientName(e.target.value)} required />
              <Input label="Business Email" placeholder="Registered contact email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              <Button type="submit" className="w-full py-4 text-lg font-black shadow-xl shadow-brand-500/20" isLoading={loading} leftIcon={<Search size={18}/>}>Unlock Dashboard</Button>
            </form>
          </Card>
        ) : (
          <div className="animate-fadeIn space-y-8">
            {/* Header with Project Context */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-3xl border border-slate-200 shadow-xl gap-4">
               <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{project.title}</h2>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1.5 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Engineering Stream — ID: {(project.id || '').slice(0, 8).toUpperCase()}
                  </p>
               </div>
               {project.show_lifecycle && (
                 <Badge variant={project.status === 'completed' ? 'success' : 'info'} className="text-lg py-2 px-8 shadow-lg uppercase font-black tracking-tight border-none bg-brand-600 text-white">
                   {project.status}
                 </Badge>
               )}
            </div>

            {/* Financial Status Card */}
            {project.show_financials && (
              <Card className="p-10 bg-secondary-900 text-white border-none shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                 <div className="flex items-center gap-3 mb-10 relative z-10">
                    <div className="p-2.5 bg-white/10 rounded-xl text-brand-400 border border-white/5">
                      <Receipt size={24} />
                    </div>
                    <h3 className="font-black uppercase tracking-widest text-sm">Engagement Financial Ledger</h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10 relative z-10">
                    <div>
                       <p className="text-[10px] text-slate-400 font-black uppercase mb-2 tracking-widest">Deal Value</p>
                       <p className="text-3xl font-black text-white">${project.total_amount.toLocaleString()}</p>
                    </div>
                    <div>
                       <p className="text-[10px] text-brand-400 font-black uppercase mb-2 tracking-widest">Amount Paid</p>
                       <p className="text-3xl font-black text-brand-400">${project.paid_amount.toLocaleString()}</p>
                    </div>
                    <div>
                       <p className="text-[10px] text-red-400 font-black uppercase mb-2 tracking-widest">Balance Due</p>
                       <p className="text-3xl font-black text-red-400">${(project.total_amount - project.paid_amount).toLocaleString()}</p>
                    </div>
                 </div>
                 
                 <div className="space-y-3 relative z-10 bg-white/5 p-6 rounded-2xl border border-white/10">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                       <span className="text-slate-400">Payment Fulfillment</span>
                       <span className="text-brand-400">{Math.round((project.paid_amount / project.total_amount) * 100) || 0}% Complete</span>
                    </div>
                    <div className="h-4 bg-white/5 rounded-full overflow-hidden p-1 border border-white/10">
                       <div 
                         className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-1000" 
                         style={{ width: `${(project.paid_amount / project.total_amount) * 100}%` }}
                       />
                    </div>
                 </div>
              </Card>
            )}

            {/* Lifecycle Visualization */}
            {project.show_lifecycle && (
              <Card className="p-10 border-slate-200">
                <div className="flex items-center justify-between mb-12">
                  <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Milestone Timeline</h3>
                  <Badge variant="neutral" className="font-black">PHASE {getStatusStep(project.status)} / 4</Badge>
                </div>
                <div className="relative flex flex-col md:flex-row justify-between gap-8 px-4">
                    {[
                      { id: 'planning', label: 'Discovery' },
                      { id: 'development', label: 'Engineering' },
                      { id: 'review', label: 'Quality Audit' },
                      { id: 'completed', label: 'Handover' }
                    ].map((step, idx) => {
                      const currentStep = getStatusStep(project.status);
                      const isDone = (idx + 1) < currentStep || project.status === 'completed';
                      const isCurrent = (idx + 1) === currentStep;

                      return (
                        <div key={step.id} className="flex-1 flex flex-row md:flex-col items-center text-center gap-5 relative z-10">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl ${
                            isDone ? 'bg-green-500 text-white' : 
                            isCurrent ? 'bg-brand-600 text-white ring-8 ring-brand-50 shadow-brand-500/30 scale-110' : 
                            'bg-slate-50 text-slate-300 border border-slate-100'
                          }`}>
                            {isDone ? <CheckCircle2 size={28}/> : <span className="font-black text-lg">{idx + 1}</span>}
                          </div>
                          <span className={`text-[11px] font-black uppercase tracking-widest ${isCurrent ? 'text-brand-600' : isDone ? 'text-green-600' : 'text-slate-400'}`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                    <div className="hidden md:block absolute top-7 left-0 w-full h-1 bg-slate-50 -z-0 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-brand-500 transition-all duration-1000" 
                         style={{ width: `${((getStatusStep(project.status) - 1) / 3) * 100}%` }}
                       />
                    </div>
                </div>
              </Card>
            )}

            {/* Assets Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {project.show_repo && (
                 <Card className="flex flex-col h-full hover:border-brand-400 transition-all p-10 border-slate-200">
                    <div className="bg-secondary-900 w-16 h-16 rounded-2xl flex items-center justify-center text-brand-400 mb-8 shadow-2xl">
                      <Code2 size={32} />
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Source Endpoint</h4>
                    <p className="text-sm text-slate-500 mb-10 leading-relaxed font-medium">Direct secure access to the production repository and codebase.</p>
                    {project.repo_link ? (
                      <a href={project.repo_link} target="_blank" rel="noopener noreferrer" className="mt-auto">
                        <Button variant="outline" className="w-full py-5 font-black text-sm uppercase tracking-widest border-2" rightIcon={<ExternalLink size={18}/>}>Open Repository</Button>
                      </a>
                    ) : (
                      <div className="mt-auto p-5 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-[11px] font-black uppercase tracking-widest text-slate-400">Access Provisioning Pending</div>
                    )}
                 </Card>
               )}

               {project.show_live && (
                 <Card className="flex flex-col h-full hover:border-brand-400 transition-all p-10 border-slate-200">
                    <div className="bg-brand-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-8 shadow-2xl shadow-brand-500/40">
                      <Globe size={32} />
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Staging Feed</h4>
                    <p className="text-sm text-slate-500 mb-10 leading-relaxed font-medium">Real-time build observer for production-ready interface developments.</p>
                    {project.live_link ? (
                      <a href={project.live_link} target="_blank" rel="noopener noreferrer" className="mt-auto">
                        <Button variant="primary" className="w-full py-5 font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-500/20" rightIcon={<ArrowRight size={18}/>}>Launch Viewport</Button>
                      </a>
                    ) : (
                      <div className="mt-auto p-5 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-[11px] font-black uppercase tracking-widest text-slate-400">Environment Readying</div>
                    )}
                 </Card>
               )}
            </div>

            <div className="text-center pt-8">
               <button onClick={() => setProject(null)} className="text-slate-400 hover:text-brand-600 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center mx-auto border border-slate-200 px-6 py-3 rounded-full hover:bg-white hover:shadow-md">
                 <ShieldAlert size={12} className="mr-2" /> Terminate Secure Session
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackProject;
