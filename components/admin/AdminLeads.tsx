
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Lead } from '../../types';
import { Search, Loader2, ChevronDown, ChevronUp, Save, FileText, Phone, RefreshCw, Download, Mail, Zap, Target } from 'lucide-react';
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

const AdminLeads: React.FC = () => {
  const { success, show, error: showError } = useToast();
  
  // View State
  const [view, setView] = useState<'leads' | 'subscribers'>('leads');

  // Leads State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Subscribers State
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);

  useEffect(() => {
    fetchLeads();
    if (view === 'subscribers') fetchSubscribers();

    // Realtime Subscription for Leads
    const channel = supabase
      .channel('public:leads')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'leads' },
        (payload) => {
          const newLead = payload.new as Lead;
          setLeads((prev) => [newLead, ...prev]);
          show(`New Lead: ${newLead.name}`, 'success');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [view]);

  const fetchLeads = async () => {
    setIsLoadingLeads(true);
    try {
      const { data, error } = await supabase.from('leads').select('*');
      if (error) throw error;
      setLeads(data as Lead[] || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
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
    } catch (err) {
      console.error('Error fetching subscribers:', err);
    } finally {
      setLoadingSubscribers(false);
    }
  };

  const updateLeadStatus = async (id: string, newStatus: 'new' | 'contacted' | 'closed') => {
    try {
      const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setLeads(prev => prev.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
      success(`Lead marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating lead status:', error);
      showError('Failed to update status');
    }
  };

  const handleExpandLead = (lead: Lead) => {
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
      success('Internal notes saved');
    } catch (err) {
      showError('Failed to save note');
    } finally {
      setIsSavingNote(false);
    }
  };

  const exportCSV = () => {
    if (view === 'leads') {
        if (leads.length === 0) {
          showError('No leads to export');
          return;
        }
        const headers = ['Name', 'Email', 'Phone', 'Service', 'Budget', 'Timeline', 'Status', 'Date', 'Message', 'Notes'];
        const csvContent = [
          headers.join(','),
          ...leads.map(lead => 
            [
              `"${lead.name}"`,
              `"${lead.email}"`,
              `"${lead.phone || ''}"`,
              `"${lead.service}"`,
              `"${lead.budget || ''}"`,
              `"${lead.timeline || ''}"`,
              `"${lead.status || 'new'}"`,
              `"${new Date(lead.created_at).toLocaleDateString()}"`,
              `"${(lead.message || '').replace(/"/g, '""')}"`,
              `"${(lead.admin_notes || '').replace(/"/g, '""')}"`
            ].join(',')
          )
        ].join('\n');
        downloadCSV(csvContent, 'leads');
    } else {
        if (subscribers.length === 0) {
            showError('No subscribers to export');
            return;
        }
        const headers = ['Email', 'Date Subscribed'];
        const csvContent = [
            headers.join(','),
            ...subscribers.map(sub => `"${sub.email}","${new Date(sub.created_at).toLocaleDateString()}"`)
        ].join('\n');
        downloadCSV(csvContent, 'newsletter_subscribers');
    }
  };

  const downloadCSV = (content: string, filenamePrefix: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filenamePrefix}_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Export successful');
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedLeads = [...leads].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === 'created_at') {
      aValue = new Date(a.created_at).getTime();
      bValue = new Date(b.created_at).getTime();
    } else if (typeof aValue === 'string') {
       aValue = aValue.toLowerCase();
       bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredLeads = sortedLeads.filter(lead => 
    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (lead.phone && lead.phone.includes(searchQuery))
  );

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <div className="w-4 h-4" />;
    return sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  return (
    <div className="animate-fadeIn">
      {/* View Toggle */}
      <div className="flex gap-4 mb-8 border-b border-slate-200 bg-white p-1 rounded-t-xl">
         <button 
           onClick={() => setView('leads')}
           className={`pb-4 px-6 text-xs font-black uppercase tracking-widest transition-all relative ${view === 'leads' ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
         >
           Leads CRM
           {view === 'leads' && <span className="absolute bottom-0 left-0 w-full h-1 bg-brand-600 rounded-t-full"></span>}
         </button>
         <button 
           onClick={() => setView('subscribers')}
           className={`pb-4 px-6 text-xs font-black uppercase tracking-widest transition-all relative ${view === 'subscribers' ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
         >
           Newsletter
           {view === 'subscribers' && <span className="absolute bottom-0 left-0 w-full h-1 bg-brand-600 rounded-t-full"></span>}
         </button>
      </div>

      {view === 'leads' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatSmall label="Ingress" count={leads.filter(l => l.status === 'new').length} color="blue" subtitle="Awaiting Action" />
            <StatSmall label="Engagement" count={leads.filter(l => l.status === 'contacted').length} color="yellow" subtitle="Strategic Dialog" />
            <StatSmall label="Conversion" count={leads.filter(l => l.status === 'closed').length} color="green" subtitle="Secured Assets" />
          </div>

          <Card noPadding className="overflow-hidden border-slate-200 shadow-sm">
            <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between bg-slate-50/50 gap-4">
                <div className="relative w-full md:w-auto md:min-w-[400px]">
                  <Input 
                    placeholder="Filter by organization, email, or endpoint..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={<Search size={16} />}
                  />
                </div>
                <div className="flex items-center gap-3">
                   <Button variant="outline" size="sm" onClick={exportCSV} leftIcon={<Download size={14} />}>Export Audit</Button>
                   <button onClick={fetchLeads} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-400 hover:text-brand-600"><RefreshCw size={16} /></button>
                </div>
            </div>
            
            {isLoadingLeads ? (
              <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-brand-600" />
                <p className="text-[10px] font-black uppercase tracking-widest">Syncing Lead Database...</p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-32 text-slate-400">
                <p className="text-sm font-bold uppercase tracking-widest">No matching records found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('name')}>
                        <div className="flex items-center gap-2">Client / Org <SortIcon field="name" /></div>
                      </th>
                      <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('service')}>
                        <div className="flex items-center gap-2">Deliverable <SortIcon field="service" /></div>
                      </th>
                      <th className="px-6 py-4">Allocation</th>
                      <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('status')}>
                         <div className="flex items-center gap-2">Status <SortIcon field="status" /></div>
                      </th>
                      <th className="px-6 py-4 text-right">Ops</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredLeads.map((lead) => (
                      <React.Fragment key={lead.id}>
                        <tr 
                          className={`hover:bg-slate-50/50 transition-colors cursor-pointer group ${expandedLeadId === lead.id ? 'bg-brand-50/30' : ''}`}
                          onClick={() => handleExpandLead(lead)}
                        >
                          <td className="px-6 py-5">
                            <div className="font-black text-slate-900 text-sm flex items-center">
                              {lead.name}
                              {lead.status === 'new' && (Date.now() - new Date(lead.created_at).getTime() < 86400000) && (
                                <span className="ml-2 w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse"></span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">
                              {lead.email}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-[10px] font-black uppercase bg-slate-900 text-white px-2 py-1 rounded-md tracking-widest">{lead.service}</span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-1">
                               <span className="text-[11px] font-black text-brand-600 uppercase tracking-tighter">{lead.budget || 'N/A'}</span>
                               <span className="text-[9px] font-bold text-slate-400 uppercase">{lead.timeline || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <Badge variant={lead.status === 'new' ? 'info' : lead.status === 'contacted' ? 'warning' : 'success'} className="uppercase font-black text-[9px] tracking-widest">
                               {(lead.status || 'new')}
                            </Badge>
                          </td>
                          <td className="px-6 py-5 text-right">
                             <button className="p-2 text-slate-300 group-hover:text-brand-600 transition-colors">
                               {expandedLeadId === lead.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                             </button>
                          </td>
                        </tr>
                        
                        {expandedLeadId === lead.id && (
                          <tr className="bg-white">
                            <td colSpan={5} className="px-6 py-8 border-b border-slate-100 bg-slate-50/30">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl">
                                 <div>
                                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Target size={14}/> Discovery Brief</h4>
                                   <div className="bg-white p-6 rounded-2xl border border-slate-200 text-sm text-slate-700 leading-relaxed font-medium shadow-sm">
                                     "{lead.message}"
                                   </div>
                                   
                                   <div className="mt-8 flex gap-3">
                                      <Button size="sm" variant={lead.status === 'new' ? 'primary' : 'outline'} onClick={() => updateLeadStatus(lead.id, 'new')} className="uppercase font-black text-[10px]">New</Button>
                                      <Button size="sm" variant={lead.status === 'contacted' ? 'primary' : 'outline'} onClick={() => updateLeadStatus(lead.id, 'contacted')} className="uppercase font-black text-[10px]">Contacted</Button>
                                      <Button size="sm" variant={lead.status === 'closed' ? 'primary' : 'outline'} onClick={() => updateLeadStatus(lead.id, 'closed')} className="uppercase font-black text-[10px]">Closed</Button>
                                   </div>
                                 </div>

                                 <div className="space-y-6">
                                   <div>
                                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><FileText size={14}/> Internal Ledger Notes</h4>
                                     <textarea
                                       className="w-full h-32 p-4 text-sm rounded-2xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 bg-white outline-none font-medium text-slate-600 shadow-sm"
                                       placeholder="Add private intelligence about this lead..."
                                       value={adminNote}
                                       onChange={(e) => setAdminNote(e.target.value)}
                                     />
                                     <div className="flex justify-end mt-3">
                                       <Button size="sm" onClick={() => saveNote(lead.id)} isLoading={isSavingNote} leftIcon={<Save size={14}/>} className="px-6 uppercase font-black text-[10px]">Commit Note</Button>
                                     </div>
                                   </div>
                                   
                                   <div className="bg-slate-900 p-5 rounded-2xl flex items-center justify-between text-white">
                                      <div>
                                         <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Receipt Date</p>
                                         <p className="text-sm font-black">{new Date(lead.created_at).toLocaleString()}</p>
                                      </div>
                                      <div className="text-right">
                                         <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Lead ID</p>
                                         <p className="text-xs font-mono opacity-60">{(lead.id || '').slice(0, 8).toUpperCase()}</p>
                                      </div>
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
        </>
      ) : (
        <Card noPadding className="border-slate-200">
           <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-brand-600 text-white rounded-lg"><Mail size={18} /></div>
                 <div>
                    <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight">Active Subscribers</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{subscribers.length} Global Nodes</p>
                 </div>
              </div>
              <Button variant="outline" size="sm" onClick={exportCSV} leftIcon={<Download size={14} />}>Export CSV</Button>
           </div>
           
           {loadingSubscribers ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-600 w-8 h-8"/></div>
           ) : subscribers.length === 0 ? (
              <div className="text-center py-20 text-slate-400 font-bold uppercase text-[10px] tracking-widest">No active subscribers.</div>
           ) : (
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                       <tr>
                          <th className="px-6 py-4">Endpoint Email</th>
                          <th className="px-6 py-4">Verification Date</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {subscribers.map(sub => (
                          <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                             <td className="px-6 py-4 text-slate-900 font-black text-sm">{sub.email}</td>
                             <td className="px-6 py-4 text-slate-400 text-xs font-bold">{new Date(sub.created_at).toLocaleDateString()}</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           )}
        </Card>
      )}
    </div>
  );
};

const StatSmall = ({ label, count, color, subtitle }: { label: string, count: number, color: string, subtitle: string }) => (
  <Card className={`border-l-4 border-slate-200 relative overflow-hidden flex flex-col justify-between ${
    color === 'blue' ? 'border-l-brand-500' : 
    color === 'yellow' ? 'border-l-yellow-400' : 
    'border-l-green-500'
  }`}>
    <div className="flex justify-between items-start">
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
      <Zap size={14} className={`${color === 'blue' ? 'text-brand-400' : color === 'yellow' ? 'text-yellow-400' : 'text-green-400'}`} />
    </div>
    <div className="mt-4">
      <h3 className="text-4xl font-black text-slate-900 leading-none">{count}</h3>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">{subtitle}</p>
    </div>
  </Card>
);

export default AdminLeads;
