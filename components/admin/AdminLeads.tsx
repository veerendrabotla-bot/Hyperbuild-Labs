
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Lead } from '../../types';
import { Search, Loader2, ChevronDown, ChevronUp, Save, FileText, Phone, RefreshCw, Download, Mail, Zap, Target, UserCheck } from 'lucide-react';
import Button from '../Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Input from '../ui/Input';
import { useToast } from '../../contexts/ToastContext';

type SortField = 'name' | 'service' | 'status' | 'created_at';
type SortDirection = 'asc' | 'desc';

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

// Extended Lead type to include joined team member data
interface LeadWithReferrer extends Lead {
  team_members?: {
    name: string;
    email: string;
  };
}

const AdminLeads: React.FC = () => {
  const { success, error: showError } = useToast();
  
  const [view, setView] = useState<'leads' | 'subscribers'>('leads');
  const [leads, setLeads] = useState<LeadWithReferrer[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);

  useEffect(() => {
    fetchLeads();
    if (view === 'subscribers') fetchSubscribers();
  }, [view]);

  const fetchLeads = async () => {
    setIsLoadingLeads(true);
    try {
      // JOIN: Fetch leads and include the name of the team member who referred them
      const { data, error } = await supabase
        .from('leads')
        .select('*, team_members(name, email)')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setLeads(data as LeadWithReferrer[] || []);
    } catch (error: any) {
      showError('Lead Sync Failed: ' + error.message);
    } finally {
      setIsLoadingLeads(false);
    }
  };

  const fetchSubscribers = async () => {
    setLoadingSubscribers(true);
    try {
      const { data, error } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setSubscribers(data as Subscriber[] || []);
    } catch (err: any) {
      showError('Subscriber Sync Failed: ' + err.message);
    } finally {
      setLoadingSubscribers(false);
    }
  };

  const updateLeadStatus = async (id: string, newStatus: 'new' | 'contacted' | 'closed') => {
    try {
      const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setLeads(prev => prev.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
      success(`Status updated to ${newStatus}`);
    } catch (error: any) {
      showError('Operation Denied: ' + error.message);
    }
  };

  const handleExpandLead = (lead: LeadWithReferrer) => {
    if (expandedLeadId === lead.id) {
      setExpandedLeadId(null);
      setAdminNote('');
    } else {
      setExpandedLeadId(lead.id);
      setAdminNote(lead.admin_notes || '');
    }
  };

  const saveNote = async (id: string) => {
    setIsSavingNote(true);
    try {
      const { error } = await supabase.from('leads').update({ admin_notes: adminNote }).eq('id', id);
      if (error) throw error;
      setLeads(prev => prev.map(l => l.id === id ? { ...l, admin_notes: adminNote } : l));
      success('Ledger notes updated');
    } catch (err: any) {
      showError('Note update failed: ' + err.message);
    } finally {
      setIsSavingNote(false);
    }
  };

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (lead.team_members?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fadeIn">
      <div className="flex gap-4 mb-8 border-b border-slate-200 bg-white p-1 rounded-t-xl">
         <button onClick={() => setView('leads')} className={`pb-4 px-6 text-xs font-black uppercase tracking-widest relative ${view === 'leads' ? 'text-brand-600' : 'text-slate-400'}`}>
           Leads CRM {view === 'leads' && <span className="absolute bottom-0 left-0 w-full h-1 bg-brand-600 rounded-t-full"></span>}
         </button>
         <button onClick={() => setView('subscribers')} className={`pb-4 px-6 text-xs font-black uppercase tracking-widest relative ${view === 'subscribers' ? 'text-brand-600' : 'text-slate-400'}`}>
           Newsletter {view === 'subscribers' && <span className="absolute bottom-0 left-0 w-full h-1 bg-brand-600 rounded-t-full"></span>}
         </button>
      </div>

      {view === 'leads' ? (
        <Card noPadding className="overflow-hidden border-slate-200 shadow-sm">
            <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between bg-slate-50/50 gap-4">
                <div className="w-full md:w-96">
                   <Input placeholder="Filter by client or source..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} icon={<Search size={16} />} />
                </div>
                <div className="flex items-center gap-3">
                   <button onClick={fetchLeads} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:text-brand-600 transition-all shadow-sm"><RefreshCw size={16} /></button>
                </div>
            </div>
            
            {isLoadingLeads ? (
              <div className="flex flex-col items-center justify-center py-32 text-slate-400"><Loader2 className="w-10 h-10 animate-spin mb-4 text-brand-600" /><p className="text-[10px] font-black uppercase">Syncing Leads...</p></div>
            ) : (
              <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Client / Org</th>
                      <th className="px-6 py-4">Deliverable</th>
                      <th className="px-6 py-4">Origin Source</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredLeads.length === 0 ? (
                      <tr><td colSpan={5} className="py-20 text-center text-slate-400 text-xs font-bold uppercase">No records found matching criteria.</td></tr>
                    ) : filteredLeads.map((lead) => (
                      <React.Fragment key={lead.id}>
                        <tr className={`hover:bg-slate-50/50 cursor-pointer group ${expandedLeadId === lead.id ? 'bg-brand-50/30' : ''}`} onClick={() => handleExpandLead(lead)}>
                          <td className="px-6 py-5">
                            <p className="font-black text-slate-900 text-sm">{lead.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{lead.email}</p>
                          </td>
                          <td className="px-6 py-5">
                            <Badge variant="neutral" className="uppercase font-black text-[9px]">{lead.service}</Badge>
                          </td>
                          <td className="px-6 py-5">
                             {lead.team_members ? (
                               <div className="flex items-center gap-2">
                                 <div className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-[8px] font-black uppercase">
                                   {lead.team_members.name.charAt(0)}
                                 </div>
                                 <p className="text-xs font-black text-slate-700">{lead.team_members.name}</p>
                               </div>
                             ) : (
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter italic">Public Inbound</p>
                             )}
                          </td>
                          <td className="px-6 py-5">
                            <Badge variant={lead.status === 'new' ? 'info' : lead.status === 'closed' ? 'success' : 'warning'}>
                              {lead.status.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <ChevronDown size={18} className={`text-slate-300 group-hover:text-brand-600 transition-transform inline-block ${expandedLeadId === lead.id ? 'rotate-180' : ''}`} />
                          </td>
                        </tr>
                        {expandedLeadId === lead.id && (
                          <tr className="bg-white">
                            <td colSpan={5} className="px-6 py-8 border-b border-slate-100 bg-slate-50/30">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                 <div>
                                   <div className="flex items-center justify-between mb-4">
                                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Discovery Brief</h4>
                                      {lead.team_members && (
                                        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                                          <UserCheck size={12} className="text-brand-600" />
                                          <span className="text-[9px] font-black text-slate-500 uppercase">Referrer: {lead.team_members.name}</span>
                                        </div>
                                      )}
                                   </div>
                                   <div className="bg-white p-6 rounded-2xl border border-slate-200 text-sm text-slate-700 leading-relaxed font-medium min-h-[120px]">
                                     {lead.message || "No message content provided."}
                                     <div className="mt-4 pt-4 border-t border-slate-50 flex gap-4 text-[10px] font-black text-slate-400 uppercase">
                                       <span>Budget: {lead.budget || 'Unspecified'}</span>
                                       <span>Timeline: {lead.timeline || 'Unspecified'}</span>
                                     </div>
                                   </div>
                                   <div className="mt-8 flex gap-3">
                                      <Button size="sm" variant={lead.status === 'new' ? 'primary' : 'outline'} onClick={(e) => { e.stopPropagation(); updateLeadStatus(lead.id, 'new'); }}>New</Button>
                                      <Button size="sm" variant={lead.status === 'contacted' ? 'primary' : 'outline'} onClick={(e) => { e.stopPropagation(); updateLeadStatus(lead.id, 'contacted'); }}>Contacted</Button>
                                      <Button size="sm" variant={lead.status === 'closed' ? 'primary' : 'outline'} onClick={(e) => { e.stopPropagation(); updateLeadStatus(lead.id, 'closed'); }}>Closed</Button>
                                   </div>
                                 </div>
                                 <div>
                                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Admin Ledger & CRM Notes</h4>
                                   <textarea 
                                     className="w-full h-32 p-4 text-sm rounded-2xl border border-slate-200 focus:border-brand-500 outline-none bg-white font-medium" 
                                     placeholder="Append intelligence to this client record..." 
                                     value={adminNote} 
                                     onChange={(e) => setAdminNote(e.target.value)} 
                                     onClick={(e) => e.stopPropagation()} 
                                   />
                                   <div className="flex justify-end mt-3">
                                     <Button size="sm" onClick={(e) => { e.stopPropagation(); saveNote(lead.id); }} isLoading={isSavingNote} leftIcon={<Save size={14}/>}>Save Record</Button>
                                   </div>
                                 </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
      ) : (
        <Card className="text-center py-20 bg-white border-slate-200">
           {loadingSubscribers ? (
             <div className="flex flex-col items-center">
               <Loader2 className="animate-spin w-8 h-8 text-brand-600 mb-2" />
               <p className="text-[10px] font-black text-slate-400 uppercase">Syncing Newsletter...</p>
             </div>
           ) : (
             <div>
                <h4 className="text-sm font-black text-slate-900 uppercase mb-2">Subscriber Database</h4>
                <p className="text-5xl font-black text-brand-600 mb-8">{subscribers.length}</p>
                <div className="max-w-lg mx-auto divide-y divide-slate-100 border rounded-2xl overflow-hidden">
                   {subscribers.map(s => (
                     <div key={s.id} className="p-3 text-sm text-slate-600 font-medium hover:bg-slate-50 transition-colors flex justify-between px-6">
                        <span>{s.email}</span>
                        <span className="text-[10px] text-slate-400">{new Date(s.created_at).toLocaleDateString()}</span>
                     </div>
                   ))}
                </div>
             </div>
           )}
        </Card>
      )}
    </div>
  );
};

export default AdminLeads;
