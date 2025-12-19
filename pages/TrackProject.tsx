
import React, { useState } from 'react';
import SEO from '../components/SEO';
import SectionHeading from '../components/SectionHeading';
import Button from '../components/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { Search, Loader2, Code2, FileText, ExternalLink, CheckCircle2, Layout, ArrowRight, Globe, Lock } from 'lucide-react';
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
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        showError('Verification failed. No active project matches these credentials.');
      } else if (data) {
        setProject(data as Project);
      }
    } catch (err) {
      showError('Authentication failed. Please verify your details.');
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
      <SEO title="Project Tracking Portal" description="Track your agency deliverables and status in real-time." />
      
      <div className="max-w-4xl mx-auto px-4">
        <SectionHeading 
          title="Project Deliveries Hub" 
          subtitle="Real-time visibility into your architecture, assets, and milestones."
        />

        {!project ? (
          <Card className="max-w-md mx-auto shadow-2xl border-brand-100 p-8">
            <form onSubmit={handleTrack} className="space-y-5">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-100">
                  <Lock size={32} className="text-brand-600" />
                </div>
                <p className="text-sm text-slate-500 font-medium">Verify your registration details to access the portal.</p>
              </div>
              <Input 
                label="Authorized Client Name"
                placeholder="Name used during booking"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                required
              />
              <Input 
                label="Authorized Email Address"
                placeholder="Registered contact email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full py-4 text-lg font-black" isLoading={loading} leftIcon={<Search size={18}/>}>
                Unlock Dashboard
              </Button>
            </form>
          </Card>
        ) : (
          <div className="animate-fadeIn space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-3xl border border-slate-200 shadow-xl gap-4">
               <div>
                  <h2 className="text-3xl font-black text-slate-900">{project.title}</h2>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Delivery Ref: {(project.id || '').slice(0, 8).toUpperCase()}</p>
               </div>
               <Badge variant={project.status === 'completed' ? 'success' : 'info'} className="text-lg py-2 px-6 shadow-md uppercase font-black tracking-tighter">
                 {project.status}
               </Badge>
            </div>

            {/* Lifecycle Timeline */}
            <Card className="p-8">
               <div className="flex items-center justify-between mb-10">
                 <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Project Lifecycle</h3>
                 <span className="text-[10px] font-black text-brand-600 uppercase bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100">Live Feed</span>
               </div>
               <div className="relative flex flex-col md:flex-row justify-between gap-8">
                  {[
                    { id: 'planning', label: 'Architecture' },
                    { id: 'development', label: 'Alpha Dev' },
                    { id: 'review', label: 'QA / Review' },
                    { id: 'completed', label: 'Deployment' }
                  ].map((step, idx) => {
                    const currentStep = getStatusStep(project.status);
                    const isDone = (idx + 1) < currentStep || project.status === 'completed';
                    const isCurrent = (idx + 1) === currentStep;

                    return (
                      <div key={step.id} className="flex-1 flex flex-row md:flex-col items-center text-center gap-4 relative z-10">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                          isDone ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 
                          isCurrent ? 'bg-brand-600 text-white shadow-xl shadow-brand-200 ring-4 ring-brand-100 scale-110' : 
                          'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}>
                           {isDone ? <CheckCircle2 size={24}/> : <span className="font-black">{idx + 1}</span>}
                        </div>
                        <span className={`text-sm font-black uppercase tracking-tighter ${isCurrent ? 'text-brand-600' : 'text-slate-500'}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                  <div className="hidden md:block absolute top-6 left-0 w-full h-0.5 bg-slate-100 -z-0"></div>
               </div>
            </Card>

            {/* Assets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Card className="flex flex-col h-full hover:border-brand-300 transition-all p-8">
                  <div className="bg-slate-900 w-14 h-14 rounded-2xl flex items-center justify-center text-brand-400 mb-6 shadow-xl">
                    <Code2 size={28} />
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-2">Development Assets</h4>
                  <p className="text-sm text-slate-500 mb-8 leading-relaxed">Direct access to the git repository for technical oversight and code review.</p>
                  {project.repo_link ? (
                    <a href={project.repo_link} target="_blank" rel="noopener noreferrer" className="mt-auto">
                      <Button variant="outline" className="w-full py-4 font-black" rightIcon={<ExternalLink size={16}/>}>Access Git Repo</Button>
                    </a>
                  ) : (
                    <div className="mt-auto p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs font-bold text-slate-400">Git access pending completion of Phase 1.</div>
                  )}
               </Card>

               <Card className="flex flex-col h-full hover:border-brand-300 transition-all p-8">
                  <div className="bg-brand-600 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl">
                    <FileText size={28} />
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-2">Technical Documentation</h4>
                  <p className="text-sm text-slate-500 mb-8 leading-relaxed">Comprehensive architecture diagrams, API specs, and user manuals.</p>
                  {project.documentation_link ? (
                    <a href={project.documentation_link} target="_blank" rel="noopener noreferrer" className="mt-auto">
                      <Button variant="outline" className="w-full py-4 font-black" rightIcon={<ExternalLink size={16}/>}>Open Knowledge Base</Button>
                    </a>
                  ) : (
                    <div className="mt-auto p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs font-bold text-slate-400">Documentation currently in review.</div>
                  )}
               </Card>
            </div>

            <div className="text-center mt-12">
               <button 
                 onClick={() => setProject(null)} 
                 className="inline-flex items-center text-slate-400 hover:text-brand-600 text-sm font-black uppercase tracking-widest transition-colors"
               >
                 Close Tracking Portal <ArrowRight size={14} className="ml-2" />
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackProject;
