import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Lead } from '../../types';
import { Search, Loader2, CheckCircle, RefreshCw, ChevronDown, ChevronUp, MoreHorizontal, Clock, Filter } from 'lucide-react';
import Button from '../Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Input from '../ui/Input';

type SortField = 'name' | 'service' | 'status' | 'created_at';
type SortDirection = 'asc' | 'desc';

const AdminLeads: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [openActionId, setOpenActionId] = useState<string | null>(null);

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
      setOpenActionId(null);
    } catch (error) {
      console.error('Error updating lead status:', error);
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
    lead.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <div className="w-4 h-4" />;
    return sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  return (
    <div onClick={() => setOpenActionId(null)}>
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
                placeholder="Search leads by name or email..."
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
                    <div className="flex items-center gap-1">Name <SortIcon field="name" /></div>
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
                  <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{lead.name}</div>
                      <div className="text-xs text-slate-500 hover:text-brand-600">
                        <a href={`mailto:${lead.email}`}>{lead.email}</a>
                      </div>
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
                    <td className="px-6 py-4 text-right relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenActionId(openActionId === lead.id ? null : lead.id);
                        }}
                        className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <MoreHorizontal size={18} />
                      </button>

                      {openActionId === lead.id && (
                        <div className="absolute right-8 top-10 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden animate-fadeIn origin-top-right">
                          <div className="p-1 space-y-0.5">
                            <button 
                              onClick={() => updateLeadStatus(lead.id, 'new')}
                              className="w-full text-left px-3 py-2 text-sm rounded-md flex items-center hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                              <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" /> Mark New
                            </button>
                            <button 
                              onClick={() => updateLeadStatus(lead.id, 'contacted')}
                              className="w-full text-left px-3 py-2 text-sm rounded-md flex items-center hover:bg-yellow-50 hover:text-yellow-600 transition-colors"
                            >
                              <Clock size={14} className="mr-2" /> Mark Contacted
                            </button>
                            <button 
                              onClick={() => updateLeadStatus(lead.id, 'closed')}
                              className="w-full text-left px-3 py-2 text-sm rounded-md flex items-center hover:bg-green-50 hover:text-green-600 transition-colors"
                            >
                              <CheckCircle size={14} className="mr-2" /> Mark Closed
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
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