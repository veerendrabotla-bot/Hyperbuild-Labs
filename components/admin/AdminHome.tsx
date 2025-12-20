
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { Lead, Appointment, Invoice } from '../../types';
import { 
  Users, DollarSign, Calendar, TrendingUp, ArrowRight, 
  Loader2, Clock, CheckCircle, BarChart3, Plus, 
  MousePointer2, IndianRupee, Receipt, ArrowUpRight,
  AlertCircle
} from 'lucide-react';
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
          supabase.from('invoices').select('*').order('created_at', { ascending: false })
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
  
  const calculateRevenue = (status: string) => {
    const usd = (invoices || []).filter(i => i.status === status && i.currency === 'USD').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const inr = (invoices || []).filter(i => i.status === status && i.currency === 'INR').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    return { usd, inr };
  };

  const revenuePaid = calculateRevenue('paid');

  const calculatePipeline = () => {
     let usd = 0;
     let inr = 0;
     (leads || []).forEach(lead => {
        if (!lead.budget || lead.status === 'closed') return;
        
        const b = lead.budget;
        if (b.includes('$1k - $5k')) usd += 3000;
        else if (b.includes('$5k - $10k')) usd += 7500;
        else if (b.includes('$10k - $25k')) usd += 17500;
        else if (b.includes('$25k+')) usd += 30000;
        else if (b.includes('$') && b.includes('(Custom)')) {
           const match = b.match(/\$(\d+)/);
           if (match) usd += parseInt(match[1]);
        }

        if (b.includes('₹80k - ₹4L')) inr += 240000;
        else if (b.includes('₹4L - ₹8L')) inr += 600000;
        else if (b.includes('₹8L - ₹20L')) inr += 1400000;
        else if (b.includes('₹20L+')) inr += 2500000;
        else if (b.includes('₹') && b.includes('(Custom)')) {
          const match = b.match(/₹(\d+)/);
          if (match) inr += parseInt(match[1]);
       }
     });
     return { usd, inr };
  };

  const pipeline = calculatePipeline();

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
    return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-brand-600 w-12 h-12" /></div>;
  }

  return (
    <div className="space-y-10 animate-fadeIn pb-10">
      {/* Dynamic Action Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ActionButton label="Dispatch Invoices" icon={<IndianRupee size={18}/>} onClick={() => setSearchParams({ tab: 'invoices' })} color="green" />
        <ActionButton label="Qualify Prospects" icon={<Users size={18}/>} onClick={() => setSearchParams({ tab: 'leads' })} color="brand" />
        <ActionButton label="Audit Taskboard" icon={<MousePointer2 size={18}/>} onClick={() => setSearchParams({ tab: 'kanban' })} color="purple" />
        <ActionButton label="Sync Calendar" icon={<Calendar size={18}/>} onClick={() => setSearchParams({ tab: 'appointments' })} color="orange" />
      </div>

      {/* Global Ledger Stats - UPDATED FOR READABILITY */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <HomeStatCard 
          label="Settled Cash (Revenue)" 
          usd={revenuePaid.usd} 
          inr={revenuePaid.inr} 
          icon={<CheckCircle className="w-5 h-5"/>} 
          theme="brand" 
        />
        <HomeStatCard 
          label="Estimated Pipeline" 
          usd={pipeline.usd} 
          inr={pipeline.inr} 
          icon={<TrendingUp className="w-5 h-5"/>} 
          theme="blue" 
        />
        <Card className="flex flex-col justify-between border-slate-200">
           <div className="flex justify-between items-start">
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Growth Funnel</p>
              <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Users size={18} /></div>
           </div>
           <div className="mt-4">
              <h3 className="text-3xl font-black text-slate-900">{totalLeads}</h3>
              <div className="flex items-center gap-1.5 mt-1">
                 <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse"></span>
                 <p className="text-[10px] font-black text-brand-600 uppercase tracking-tighter">{newLeads} Fresh Inquiries</p>
              </div>
           </div>
        </Card>
        <Card className="flex flex-col justify-between border-slate-200">
           <div className="flex justify-between items-start">
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Active Schedule</p>
              <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Calendar size={18} /></div>
           </div>
           <div className="mt-4">
              <h3 className="text-3xl font-black text-slate-900">
                {(appointments || []).filter(a => new Date(a.date) > new Date() && a.status !== 'cancelled').length}
              </h3>
              <p className="text-[10px] font-black text-orange-600 mt-1 uppercase tracking-tighter">Calls booked this week</p>
           </div>
        </Card>
      </div>

      {/* Analytics & Invoices Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="h-80 flex flex-col border-slate-200" noPadding>
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                <h3 className="font-black text-slate-900 text-[11px] uppercase tracking-widest flex items-center gap-2">
                  <BarChart3 size={16} className="text-brand-600" /> Marketing Lead Velocity
                </h3>
                <Badge variant="neutral" className="font-black text-slate-600">6 MONTH LOOKBACK</Badge>
             </div>
             <div className="flex-1 p-8 flex items-end justify-between gap-6">
                {chartData.map((data, idx) => {
                  const heightPercentage = Math.max((data.count / maxCount) * 100, 5);
                  return (
                    <div key={idx} className="flex flex-col items-center flex-1 group">
                       <div className="relative w-full flex justify-center items-end h-40 bg-slate-50/50 rounded-2xl overflow-hidden border border-slate-100/50">
                          <div 
                            className="w-full mx-2 bg-brand-500/80 group-hover:bg-brand-600 transition-all duration-700 rounded-t-xl"
                            style={{ height: `${heightPercentage}%` }}
                          />
                          <div className="absolute top-2 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 bg-secondary-900 text-white text-[9px] py-1 px-2 rounded-lg font-black uppercase">
                            {data.count} hits
                          </div>
                       </div>
                       <span className="mt-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">{data.month}</span>
                    </div>
                  );
                })}
             </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card noPadding className="border-slate-200">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                <h3 className="font-black text-slate-900 text-[10px] uppercase tracking-widest">Prospect Ingress</h3>
                <button onClick={() => setSearchParams({ tab: 'leads' })} className="text-brand-600">
                  <ArrowUpRight size={16} />
                </button>
              </div>
              <div className="divide-y divide-slate-50">
                {(leads || []).slice(0, 4).map(lead => (
                  <div key={lead.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mr-3 text-xs font-black ${
                        lead.status === 'new' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {lead.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-900 text-xs truncate">{lead.name}</p>
                        <p className="text-[9px] font-black text-slate-500 uppercase truncate">{lead.service}</p>
                      </div>
                    </div>
                    <Badge variant={lead.status === 'new' ? 'info' : lead.status === 'closed' ? 'success' : 'warning'} className="text-[9px] px-2 py-0.5">
                       {lead.status.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card noPadding className="border-slate-200">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                <h3 className="font-black text-slate-900 text-[10px] uppercase tracking-widest">Recent Invoices</h3>
                <button onClick={() => setSearchParams({ tab: 'invoices' })} className="text-brand-600">
                  <ArrowUpRight size={16} />
                </button>
              </div>
              <div className="divide-y divide-slate-50">
                {(invoices || []).slice(0, 4).map(inv => (
                  <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center mr-3 text-slate-500">
                        <Receipt size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-900 text-xs truncate">{inv.client_name}</p>
                        <p className="text-[9px] font-black text-slate-600">
                          {inv.currency === 'INR' ? '₹' : '$'}{Number(inv.amount).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={inv.status === 'paid' ? 'success' : 'warning'} className="text-[9px] px-2 py-0.5">
                       {inv.status.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <Card className="flex flex-col border-slate-200" noPadding>
            <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
              <h3 className="font-black text-slate-900 text-[10px] uppercase tracking-widest">Operational Calendar</h3>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            </div>
            <div className="p-5 space-y-4 flex-1">
              {(appointments || [])
                .filter(a => new Date(a.date) > new Date() && a.status !== 'cancelled')
                .slice(0, 6)
                .map(apt => (
                  <div key={apt.id} className="flex items-center p-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-brand-200 transition-all group">
                     <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center min-w-[52px] mr-4 group-hover:bg-brand-50 transition-colors">
                        <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">{new Date(apt.date).toLocaleDateString('en-US', { month: 'short' })}</div>
                        <div className="text-xl font-black text-slate-900 leading-none">{new Date(apt.date).getDate()}</div>
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-900 truncate">{apt.name}</p>
                        <p className="text-[9px] text-slate-500 font-black flex items-center mt-1 uppercase tracking-tighter">
                          <Clock size={10} className="mr-1 text-brand-500"/> 
                          {new Date(apt.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                     </div>
                     <ArrowRight size={14} className="text-slate-200 group-hover:text-brand-500 transition-colors" />
                  </div>
              ))}
              {(appointments || []).filter(a => new Date(a.date) > new Date() && a.status !== 'cancelled').length === 0 && (
                <div className="py-10 text-center text-slate-400">
                  <Calendar size={24} className="mx-auto mb-2 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No upcoming calls</p>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50/20">
               <button onClick={() => setSearchParams({ tab: 'appointments' })} className="w-full py-3.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20">
                 Manage Full Schedule
               </button>
            </div>
          </Card>

          <Card className="bg-brand-50 border-brand-100 p-6">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white rounded-lg text-brand-600"><AlertCircle size={18}/></div>
                <h4 className="font-black text-brand-900 text-xs uppercase tracking-widest">Admin Tip</h4>
             </div>
             <p className="text-xs text-brand-700 font-medium leading-relaxed">
               Leads marked as <span className="font-black">"WON"</span> in the CRM will not appear in the "Estimated Pipeline" to keep your revenue projections clean and focused on pending deals.
             </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({ label, icon, onClick, color }: { label: string, icon: React.ReactNode, onClick: () => void, color: string }) => (
  <button onClick={onClick} className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 hover:border-brand-400 hover:shadow-xl transition-all text-left group">
    <div className={`p-3 rounded-xl transition-colors ${
      color === 'green' ? 'bg-green-50 text-green-600 group-hover:bg-green-600' :
      color === 'brand' ? 'bg-brand-50 text-brand-600 group-hover:bg-brand-600' :
      color === 'orange' ? 'bg-orange-50 text-orange-600 group-hover:bg-orange-600' :
      'bg-purple-50 text-purple-600 group-hover:bg-purple-600'
    } group-hover:text-white`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest truncate">Manage Component</p>
      <p className="font-black text-slate-900 text-[11px] uppercase tracking-tight truncate">{label}</p>
    </div>
  </button>
);

const HomeStatCard = ({ label, usd, inr, icon, theme }: { label: string, usd: number, inr: number, icon: React.ReactNode, theme: string }) => (
  <Card className={`relative overflow-hidden border border-slate-200 bg-white transition-all hover:shadow-lg`}>
     <div className="flex justify-between items-start relative z-10">
        <p className={`text-[10px] font-black uppercase tracking-widest text-slate-500`}>{label}</p>
        <div className={`p-2 rounded-lg ${theme === 'brand' ? 'bg-brand-50 text-brand-600' : 'bg-slate-50 text-slate-600'}`}>{icon}</div>
     </div>
     <div className="mt-4 relative z-10">
        <div className="flex items-baseline gap-2">
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">USD:</span>
           <h3 className="text-2xl font-black text-slate-900">${usd.toLocaleString()}</h3>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">INR:</span>
           <p className="text-lg font-black text-brand-600">₹{inr.toLocaleString()}</p>
        </div>
     </div>
     {/* Subtle decorative background element for each theme */}
     <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 ${theme === 'brand' ? 'bg-brand-500' : 'bg-slate-500'}`}></div>
  </Card>
);

export default AdminHome;
