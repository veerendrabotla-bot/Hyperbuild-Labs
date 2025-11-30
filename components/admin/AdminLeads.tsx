import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Lead } from '../../types';
import { Search, Loader2, CheckCircle, RefreshCw, ChevronDown, ChevronUp, MoreHorizontal, Clock, Save, FileText, Phone } from 'lucide-react';
import Button from '../Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Input from '../ui/Input';
import { useToast } from '../../contexts/ToastContext';

type SortField = 'name' | 'service' | 'status' | 'created_at';
type SortDirection = 'asc' | 'desc';

const AdminLeads: React.FC = () => {
  const { success, error: showError } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

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
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="flex items-center">
           <div className="bg-blue-50 p-3 rounded-full mr-4 text-blue-600 font-bold text-xl">{leads.filter(l => l.status === 'new').length}</div>
           <div><p className="text-sm text-slate-500">New Leads</p><p className="font-bold text-slate-900">Action Required</p></div>
        </Card>
        <Card className="flex items-center">
           <div className="bg-yellow-50 p-3 rounded-full mr-4 text-yellow-600 font-bold text-xl">{leads.filter(l => l.status === 'contacted').length}</div>
           <div><p className="text-sm text-slate-500">In Progress</p><p className="font-bold text-slate-900">Contacted</p></div>
        </Card>
        <Card className="flex items-center">
           <div className="bg-green-50 p-3 rounded-full mr-4 text-green-600 font-bold text-xl">{leads.filter(l => l.status === 'closed').length}</div>
           <div><p className="text-sm text-slate-500">Won</p><p className="font-bold text-slate-900">Closed Deals</p></div>
        </Card>
      </div>

      <Card noPadding className="overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between bg-slate-50/50 gap-4">
            <div className="relative w-full md:w-auto md:min-w-[300px]">
              <Input 
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search size={16} />}
              />
            </div>
            <div className="flex items-center gap-3">
               <span className="text-sm text-slate-500 font-medium">
                 {filteredLeads.length} records
               </span>
               <Button variant="outline" size="sm" onClick={fetchLeads} leftIcon={<RefreshCw size={14} />}>Refresh</Button>
            </div>
        </div>
        
        {isLoadingLeads ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p>Loading leads...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p>No leads found matching your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1">Name / Phone <SortIcon field="name" /></div>
                  </th>
                  <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('service')}>
                    <div className="flex items-center gap-1">Service <SortIcon field="service" /></div>
                  </th>
                  <th className="px-6 py-4 font-semibold">Details</th>
                  <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('status')}>
                     <div className="flex items-center gap-1">Status <SortIcon field="status" /></div>
                  </th>
                  <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('created_at')}>
                     <div className="flex items-center gap-1">Date <SortIcon field="created_at" /></div>
                  </th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.map((lead) => (
                  <React.Fragment key={lead.id}>
                    <tr 
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${expandedLeadId === lead.id ? 'bg-slate-50' : ''}`}
                      onClick={() => handleExpandLead(lead)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{lead.name}</div>
                        <div className="text-xs text-slate-500 hover:text-brand-600 mb-1">
                          <a href={`mailto:${lead.email}`} onClick={e => e.stopPropagation()}>{lead.email}</a>
                        </div>
                        {lead.phone && (
                           <div className="text-xs text-slate-500 flex items-center">
                             <Phone size={10} className="mr-1"/> {lead.phone}
                           </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">{lead.service}</td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        <div className="flex flex-col gap-1">
                           <Badge variant="neutral">{lead.budget || 'N/A'}</Badge>
                           <span className="text-slate-400 pl-1">{lead.timeline || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={lead.status === 'new' ? 'info' : lead.status === 'contacted' ? 'warning' : 'success'}>
                           {lead.status === 'new' && <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />}
                           {lead.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-slate-600">
                           {expandedLeadId === lead.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Detail View */}
                    {expandedLeadId === lead.id && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={6} className="px-6 py-4 border-b border-slate-100 shadow-inner">
                          <div className="flex flex-col md:flex-row gap-6">
                             {/* Message */}
                             <div className="flex-1">
                               <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Message</h4>
                               <div className="bg-white p-3 rounded-lg border border-slate-200 text-sm text-slate-700 italic">
                                 "{lead.message}"
                               </div>
                               
                               <div className="mt-4 flex gap-2">
                                  <Button size="sm" variant={lead.status === 'new' ? 'primary' : 'outline'} onClick={() => updateLeadStatus(lead.id, 'new')}>
                                    Mark New
                                  </Button>
                                  <Button size="sm" variant={lead.status === 'contacted' ? 'primary' : 'outline'} onClick={() => updateLeadStatus(lead.id, 'contacted')}>
                                    Mark Contacted
                                  </Button>
                                  <Button size="sm" variant={lead.status === 'closed' ? 'primary' : 'outline'} onClick={() => updateLeadStatus(lead.id, 'closed')}>
                                    Mark Closed
                                  </Button>
                               </div>
                             </div>

                             {/* Internal Notes */}
                             <div className="flex-1">
                               <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center">
                                 <FileText size={12} className="mr-1"/> Internal Notes (Admin Only)
                               </h4>
                               <textarea
                                 className="w-full h-24 p-3 text-sm rounded-lg border border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white"
                                 placeholder="Add private notes about this lead (e.g. Call summary)..."
                                 value={adminNote}
                                 onChange={(e) => setAdminNote(e.target.value)}
                               />
                               <div className="flex justify-end mt-2">
                                 <Button 
                                   size="sm" 
                                   onClick={() => saveNote(lead.id)}
                                   isLoading={isSavingNote}
                                   leftIcon={<Save size={14}/>}
                                 >
                                   Save Note
                                 </Button>
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
    </div>
  );
};

export default AdminLeads;