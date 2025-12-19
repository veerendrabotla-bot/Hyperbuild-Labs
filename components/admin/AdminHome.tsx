
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { Lead, Appointment, Invoice } from '../../types';
import { Users, DollarSign, Calendar, TrendingUp, ArrowRight, Loader2, Clock, CheckCircle, BarChart3, Plus, MousePointer2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const AdminHome: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [, setSearchParams] = useSearchParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leadsRes, apptRes, invRes] = await Promise.all([
          supabase.from('leads').select('*').order('created_at', { ascending: false }),
          supabase.from('appointments').select('*').order('date', { ascending: true }),
          supabase.from('invoices').select('*')
        ]);
        
        if (leadsRes.data) setLeads(leadsRes.data as Lead[]);
        if (apptRes.data) setAppointments(apptRes.data as Appointment[]);
        if (invRes.data) setInvoices(invRes.data as Invoice[]);
      } catch (error) {
        console.error("Error fetching stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalLeads = leads?.length || 0;
  const newLeads = leads?.filter(l => l.status === 'new').length || 0;
  
  const revenueCollected = (invoices || [])
    .filter(i => i?.status === 'paid')
    .reduce((acc, curr) => acc + (Number(curr?.amount) || 0), 0);

  const pendingInvoiceAmount = (invoices || [])
    .filter(i => i?.status === 'sent')
    .reduce((acc, curr) => acc + (Number(curr?.amount) || 0), 0);

  const pipelineValue = (leads || []).reduce((acc, lead) => {
    if (!lead.budget || lead.status === 'closed') return acc;
    const match = lead.budget.match(/\$(\d+)k/); 
    if (match && match[1]) {
      return acc + (parseInt(match[1]) * 1000);
    }
    if (lead.budget.includes('< $1k')) return acc + 500;
    if (lead.budget.includes('$25k+')) return acc + 25000;
    return acc;
  }, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumSignificantDigits: 3,
    }).format(amount);
  };

  const chartData = (() => {
    const months = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = d.toLocaleString('default', { month: 'short' });
      const count = leads.filter(l => {
        const lDate = new Date(l.created_at);
        return lDate.getMonth() === d.getMonth() && lDate.getFullYear() === d.getFullYear();
      }).length;
      months.push({ month: monthKey, count });
    }
    return months;
  })();

  const maxCount = Math.max(...chartData.map(d => d.count), 5);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-600" /></div>;
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Quick Actions Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={() => setSearchParams({ tab: 'leads' })}
          className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 hover:border-brand-500 hover:shadow-lg transition-all text-left group"
        >
          <div className="p-3 bg-brand-50 text-brand-600 rounded-xl group-hover:bg-brand-600 group-hover:text-white transition-colors">
            <Users size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Action</p>
            <p className="font-bold text-slate-900">Manage New Leads</p>
          </div>
        </button>
        <button 
          onClick={() => setSearchParams({ tab: 'invoices' })}
          className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 hover:border-brand-500 hover:shadow-lg transition-all text-left group"
        >
          <div className="p-3 bg-green-50 text-green-600 rounded-xl group-hover:bg-green-600 group-hover:text-white transition-colors">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Financials</p>
            <p className="font-bold text-slate-900">Create Invoice</p>
          </div>
        </button>
        <button 
          onClick={() => setSearchParams({ tab: 'kanban' })}
          className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 hover:border-brand-500 hover:shadow-lg transition-all text-left group"
        >
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <MousePointer2 size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Operations</p>
            <p className="font-bold text-slate-900">Track Tasks</p>
          </div>
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-brand-600 to-brand-700 text-white border-none shadow-xl shadow-brand-500/20">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-brand-100 text-sm font-medium mb-1">Total Revenue</p>
              <h3 className="text-3xl font-black">{formatCurrency(revenueCollected)}</h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg"><DollarSign className="w-6 h-6 text-white" /></div>
          </div>
          <div className="mt-4 flex items-center text-[10px] font-black uppercase tracking-widest text-brand-100">
             <CheckCircle size={10} className="mr-1" /> Verified Transactions
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">Pipeline Value</p>
              <h3 className="text-3xl font-bold text-slate-900">{formatCurrency(pipelineValue)}</h3>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg"><TrendingUp className="w-6 h-6 text-blue-600" /></div>
          </div>
          <p className="text-xs text-slate-400 mt-4 flex items-center font-medium">
            <Plus size={10} className="mr-1"/> {formatCurrency(pendingInvoiceAmount)} Invoiced
          </p>
        </Card>

        <Card>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">Total Leads</p>
              <h3 className="text-3xl font-bold text-slate-900">{totalLeads}</h3>
            </div>
            <div className="bg-slate-100 p-2 rounded-lg"><Users className="w-6 h-6 text-slate-600" /></div>
          </div>
          <div className="flex items-center mt-4 text-xs font-bold">
             <span className="text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full mr-2">
               {newLeads} Hot
             </span>
             <span className="text-slate-400">Requires Follow-up</span>
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">Discovery Calls</p>
              <h3 className="text-3xl font-bold text-slate-900">
                {(appointments || []).filter(a => new Date(a.date) > new Date() && a.status !== 'cancelled').length}
              </h3>
            </div>
            <div className="bg-orange-100 p-2 rounded-lg"><Calendar className="w-6 h-6 text-orange-600" /></div>
          </div>
          <p className="text-xs text-slate-400 mt-4 font-bold uppercase tracking-tighter">Upcoming 14 Days</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="h-80 flex flex-col" noPadding>
             <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest flex items-center gap-2">
                  <BarChart3 size={18} className="text-brand-600" /> 
                  Lead Velocity
                </h3>
             </div>
             <div className="flex-1 p-6 flex items-end justify-between gap-4">
                {chartData.map((data, idx) => {
                  const heightPercentage = Math.max((data.count / maxCount) * 100, 5);
                  return (
                    <div key={idx} className="flex flex-col items-center flex-1 group">
                       <div className="relative w-full flex justify-center items-end h-44 bg-slate-50 rounded-xl overflow-hidden">
                          <div 
                            className="w-full mx-1 bg-brand-500/80 group-hover:bg-brand-600 transition-all duration-500 rounded-t-lg"
                            style={{ height: `${heightPercentage}%` }}
                          ></div>
                          <div className="absolute top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg font-bold">
                            {data.count}
                          </div>
                       </div>
                       <span className="mt-3 text-[10px] font-black text-slate-400 uppercase tracking-tighter">{data.month}</span>
                    </div>
                  );
                })}
             </div>
          </Card>

          <Card noPadding>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">Recent Activity</h3>
              <button 
                onClick={() => setSearchParams({ tab: 'leads' })}
                className="text-brand-600 text-xs font-black uppercase tracking-widest hover:text-brand-700 transition-colors flex items-center"
              >
                Full CRM <ArrowRight size={14} className="ml-1" />
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {(leads || []).slice(0, 5).map(lead => (
                <div key={lead.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 text-xs font-black ${
                      lead.status === 'new' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {lead.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{lead.name}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lead.service}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className="text-[10px] font-black text-slate-400 uppercase hidden sm:block">{new Date(lead.created_at).toLocaleDateString()}</span>
                     <Badge variant={lead.status === 'new' ? 'info' : lead.status === 'closed' ? 'success' : 'warning'}>
                       {lead.status.toUpperCase()}
                     </Badge>
                  </div>
                </div>
              ))}
              {leads?.length === 0 && <div className="p-8 text-center text-slate-400 text-sm">Waiting for incoming leads...</div>}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col" noPadding>
            <div className="p-6 border-b border-slate-100 bg-slate-50/30">
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">Upcoming Calls</h3>
            </div>
            <div className="p-4 space-y-3 flex-1">
              {(appointments || [])
                .filter(a => new Date(a.date) > new Date() && a.status !== 'cancelled')
                .slice(0, 8)
                .map(apt => (
                  <div key={apt.id} className="flex items-center p-3 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-brand-200 transition-all group">
                     <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center min-w-[48px] mr-3 group-hover:bg-brand-50 group-hover:border-brand-100 transition-colors">
                        <div className="text-[9px] text-slate-400 font-black uppercase tracking-tighter group-hover:text-brand-500">{new Date(apt.date).toLocaleDateString('en-US', { month: 'short' })}</div>
                        <div className="text-lg font-black text-slate-900 leading-none group-hover:text-brand-700">{new Date(apt.date).getDate()}</div>
                     </div>
                     <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-slate-900 truncate">{apt.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold flex items-center mt-0.5">
                          <Clock size={10} className="mr-1 text-brand-500"/> 
                          {new Date(apt.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                     </div>
                     <ArrowRight size={14} className="text-slate-200 group-hover:text-brand-500 transition-colors" />
                  </div>
              ))}
              {(appointments || []).filter(a => new Date(a.date) > new Date() && a.status !== 'cancelled').length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="mx-auto text-slate-200 mb-3" size={32} />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Clear Schedule</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100">
               <button 
                 onClick={() => setSearchParams({ tab: 'appointments' })}
                 className="w-full py-2.5 bg-slate-50 text-slate-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all"
               >
                 View Full Calendar
               </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
