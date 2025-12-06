import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { Lead, Appointment, Invoice } from '../../types';
import { Users, DollarSign, Calendar, TrendingUp, ArrowRight, Loader2, Clock, CheckCircle, BarChart3 } from 'lucide-react';

const AdminHome: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

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

  // Calculate Metrics safely
  const totalLeads = leads?.length || 0;
  const newLeads = leads?.filter(l => l.status === 'new').length || 0;
  
  // Financial Metrics with safety checks
  const revenueCollected = (invoices || [])
    .filter(i => i?.status === 'paid')
    .reduce((acc, curr) => acc + (Number(curr?.amount) || 0), 0);

  const pendingInvoiceAmount = (invoices || [])
    .filter(i => i?.status === 'sent')
    .reduce((acc, curr) => acc + (Number(curr?.amount) || 0), 0);

  // Estimate Pipeline Value (Naive calculation based on budget string)
  const pipelineValue = (leads || []).reduce((acc, lead) => {
    if (!lead.budget || lead.status === 'closed') return acc; // Don't count closed deals in pipeline
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

  // Chart Logic: Last 6 Months Lead Velocity
  const getChartData = () => {
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
  };

  const chartData = getChartData();
  const maxCount = Math.max(...chartData.map(d => d.count), 5); // Minimum scale of 5

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-600" /></div>;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* REVENUE CARD (Real Money) */}
        <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white border-none shadow-lg shadow-green-500/20">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm font-medium mb-1">Revenue Collected</p>
              <h3 className="text-3xl font-bold">{formatCurrency(revenueCollected)}</h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-green-100">
             <CheckCircle size={12} className="mr-1" />
             {(invoices || []).filter(i => i.status === 'paid').length} Paid Invoices
          </div>
        </Card>

        {/* PIPELINE CARD (Potential Money) */}
        <Card>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">Total Pipeline</p>
              <h3 className="text-3xl font-bold text-slate-900">{formatCurrency(pipelineValue)}</h3>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            + {formatCurrency(pendingInvoiceAmount)} in pending invoices
          </p>
        </Card>

        {/* ACTIVE LEADS */}
        <Card>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">Active Leads</p>
              <h3 className="text-3xl font-bold text-slate-900">{totalLeads}</h3>
            </div>
            <div className="bg-brand-100 p-2 rounded-lg">
              <Users className="w-6 h-6 text-brand-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-xs font-medium">
             <span className="text-brand-600 bg-brand-50 px-2 py-0.5 rounded mr-2 flex items-center">
               <div className="w-1.5 h-1.5 bg-brand-500 rounded-full mr-1 animate-pulse"></div> {newLeads} New
             </span>
             <span className="text-slate-400">Requires Action</span>
          </div>
        </Card>

        {/* APPOINTMENTS */}
        <Card>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">Upcoming Calls</p>
              <h3 className="text-3xl font-bold text-slate-900">
                {(appointments || []).filter(a => new Date(a.date) > new Date() && a.status !== 'cancelled').length}
              </h3>
            </div>
            <div className="bg-purple-100 p-2 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">Scheduled in next 14 days</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column: Chart & Leads */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Lead Velocity Chart */}
          <Card className="h-80 flex flex-col" noPadding>
             <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 size={18} className="text-brand-600" /> 
                  Growth Velocity
                </h3>
                <span className="text-xs text-slate-400">Last 6 Months</span>
             </div>
             <div className="flex-1 p-6 flex items-end justify-between gap-4">
                {chartData.map((data, idx) => {
                  const heightPercentage = Math.max((data.count / maxCount) * 100, 5); // Min 5% height
                  return (
                    <div key={idx} className="flex flex-col items-center flex-1 group">
                       <div className="relative w-full flex justify-center items-end h-40 bg-slate-50 rounded-lg overflow-hidden">
                          <div 
                            className="w-full mx-2 bg-brand-500/80 group-hover:bg-brand-500 transition-all duration-500 rounded-t-sm"
                            style={{ height: `${heightPercentage}%` }}
                          ></div>
                          <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs py-1 px-2 rounded mb-1">
                            {data.count} Leads
                          </div>
                       </div>
                       <span className="mt-3 text-xs font-medium text-slate-500">{data.month}</span>
                    </div>
                  );
                })}
             </div>
          </Card>

          {/* Recent Leads List */}
          <Card className="flex-1" noPadding>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Recent Leads</h3>
              <button onClick={() => window.location.hash = '#/admin/dashboard?tab=leads'} className="text-brand-600 text-sm font-medium hover:underline flex items-center">
                View All <ArrowRight size={14} className="ml-1" />
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {(leads || []).slice(0, 5).map(lead => (
                <div key={lead.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 text-sm font-bold ${
                      lead.status === 'new' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {lead.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{lead.name}</p>
                      <p className="text-xs text-slate-500">{lead.service}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <span className="text-xs text-slate-400 hidden sm:block">{new Date(lead.created_at).toLocaleDateString()}</span>
                     <Badge variant={lead.status === 'new' ? 'info' : lead.status === 'closed' ? 'success' : 'warning'}>
                       {lead.status}
                     </Badge>
                  </div>
                </div>
              ))}
              {leads?.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">No leads yet.</div>}
            </div>
          </Card>
        </div>

        {/* Sidebar Column: Schedule */}
        <div className="lg:col-span-1">
          <Card className="h-full" noPadding>
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Upcoming Appointments</h3>
            </div>
            <div className="p-4 space-y-3">
              {(appointments || [])
                .filter(a => new Date(a.date) > new Date() && a.status !== 'cancelled')
                .slice(0, 5)
                .map(apt => (
                  <div key={apt.id} className="flex items-start p-3 bg-slate-50 rounded-lg border border-slate-100">
                     <div className="bg-white p-2 rounded border border-slate-200 text-center min-w-[50px] mr-3">
                        <div className="text-[10px] text-slate-500 font-bold uppercase">{new Date(apt.date).toLocaleDateString('en-US', { month: 'short' })}</div>
                        <div className="text-lg font-bold text-slate-900 leading-none">{new Date(apt.date).getDate()}</div>
                     </div>
                     <div>
                        <p className="text-sm font-semibold text-slate-900 line-clamp-1">{apt.name}</p>
                        <p className="text-xs text-slate-500 flex items-center mt-1">
                          <Clock size={12} className="mr-1"/> 
                          {new Date(apt.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                     </div>
                  </div>
              ))}
              {(appointments || []).filter(a => new Date(a.date) > new Date() && a.status !== 'cancelled').length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No upcoming calls.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;