
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Invoice } from '../../types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { Plus, Download, FileText, Loader2, DollarSign, Filter, RefreshCw, Mail, Check, IndianRupee } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import emailjs from '@emailjs/browser';
import { EMAILJS_SERVICE_ID, EMAILJS_INVOICE_TEMPLATE_ID, EMAILJS_PUBLIC_KEY } from '../../constants';

const AdminInvoices: React.FC = () => {
  const { success, error: showError } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({ client_name: '', amount: 0, status: 'draft', currency: 'USD' });
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);

  useEffect(() => {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
    if (!error && data) setInvoices(data as Invoice[]);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!newInvoice.client_name || !newInvoice.amount) return;
    try {
      const { error } = await supabase.from('invoices').insert([newInvoice]);
      if (error) throw error;
      success('Invoice record generated');
      setIsModalOpen(false);
      fetchInvoices();
      setNewInvoice({ client_name: '', amount: 0, status: 'draft', currency: 'USD' });
    } catch (err: any) {
      showError(err.message);
    }
  };

  const updateStatus = async (id: string, status: Invoice['status']) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
    await supabase.from('invoices').update({ status }).eq('id', id);
    success('Ledger updated');
  };

  const sendInvoiceEmail = async (invoice: Invoice) => {
    if (!invoice.client_email) {
      showError('No client email on file');
      return;
    }
    
    setSendingEmailId(invoice.id);
    try {
      if (EMAILJS_SERVICE_ID === 'service_placeholder' || !EMAILJS_INVOICE_TEMPLATE_ID) {
        throw new Error("Email service not configured");
      }

      const symbol = invoice.currency === 'INR' ? '₹' : '$';

      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_INVOICE_TEMPLATE_ID, {
        to_name: invoice.client_name,
        to_email: invoice.client_email,
        amount: `${symbol}${invoice.amount.toLocaleString()}`,
        status: (invoice.status || 'draft').toUpperCase(),
        due_date: invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'Upon Receipt',
        invoice_link: `${window.location.origin}/#/invoices/${invoice.id}`
      });

      success(`Transmitted to ${invoice.client_email}`);
      if (invoice.status === 'draft') updateStatus(invoice.id, 'sent');
    } catch (err: any) {
      showError('Transmission error');
    } finally {
      setSendingEmailId(null);
    }
  };

  const getSymbol = (c: string | undefined) => c === 'INR' ? '₹' : '$';

  // Grouped Totals Logic
  const calculateTotal = (status: string) => {
    const usd = invoices.filter(i => i.status === status && i.currency === 'USD').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const inr = invoices.filter(i => i.status === status && i.currency === 'INR').reduce((acc, curr) => acc + Number(curr.amount), 0);
    return { usd, inr };
  };

  const pending = calculateTotal('sent');
  const collected = calculateTotal('paid');
  const overdue = calculateTotal('overdue');

  const filteredInvoices = filterStatus === 'all' 
    ? invoices 
    : invoices.filter(inv => inv.status === filterStatus);

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
         <div>
           <h2 className="text-2xl font-black text-slate-900 tracking-tight">Financial Treasury</h2>
           <p className="text-sm text-slate-500 font-medium">Manage cross-border billing and revenue collection.</p>
         </div>
         <div className="flex gap-3">
            <Button variant="outline" onClick={() => {}} leftIcon={<Download size={18}/>}>Export Audit</Button>
            <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus size={18}/>}>Issue Invoice</Button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard title="Projected Revenue" amount={pending} color="yellow" icon={<DollarSign size={24}/>} />
        <StatCard title="Cash Collected" amount={collected} color="green" icon={<Check size={24}/>} />
        <StatCard title="Arrears / Overdue" amount={overdue} color="red" icon={<FileText size={24}/>} />
      </div>

      <Card noPadding className="overflow-hidden border-slate-200">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
           <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
               <Filter size={14} className="text-slate-400"/>
               <select 
                 className="bg-transparent text-xs font-black uppercase text-slate-600 focus:outline-none"
                 value={filterStatus}
                 onChange={(e) => setFilterStatus(e.target.value)}
               >
                 <option value="all">All Invoices</option>
                 <option value="draft">Drafts</option>
                 <option value="sent">Sent</option>
                 <option value="paid">Paid</option>
                 <option value="overdue">Overdue</option>
               </select>
             </div>
           </div>
           <button onClick={fetchInvoices} className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-brand-600 transition-all"><RefreshCw size={16}/></button>
        </div>

        {loading ? (
          <div className="py-24 flex justify-center"><Loader2 className="animate-spin text-brand-600 w-10 h-10"/></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Beneficiary</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date Issued</th>
                  <th className="px-6 py-4 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-black text-slate-900 text-sm">{inv.client_name}</p>
                      {inv.client_email && <p className="text-xs text-slate-400 font-medium">{inv.client_email}</p>}
                    </td>
                    <td className="px-6 py-4">
                       <span className="font-black text-slate-700 text-sm">{getSymbol(inv.currency)}{Number(inv.amount).toLocaleString()}</span>
                       <span className="text-[10px] ml-1 text-slate-400 font-bold uppercase">{inv.currency}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={inv.status === 'paid' ? 'success' : inv.status === 'overdue' ? 'danger' : inv.status === 'sent' ? 'warning' : 'neutral'}>
                        {(inv.status || 'draft').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-500">{new Date(inv.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {inv.client_email && (
                          <button 
                            onClick={() => sendInvoiceEmail(inv)}
                            disabled={sendingEmailId === inv.id}
                            className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:text-brand-600 hover:border-brand-400 transition-all shadow-sm disabled:opacity-50"
                          >
                            {sendingEmailId === inv.id ? <Loader2 size={16} className="animate-spin"/> : <Mail size={16} />}
                          </button>
                        )}
                        {inv.status !== 'paid' && (
                          <button 
                            onClick={() => updateStatus(inv.id, 'paid')}
                            className="p-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all shadow-md shadow-brand-500/20"
                          >
                            <Check size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Generate Legal Invoice">
         <div className="space-y-6">
           <div className="grid grid-cols-2 gap-4">
             <Input label="Client Name" value={newInvoice.client_name} onChange={e => setNewInvoice({...newInvoice, client_name: e.target.value})} placeholder="Enterprise Organization"/>
             <Input label="Client Email" type="email" value={newInvoice.client_email} onChange={e => setNewInvoice({...newInvoice, client_email: e.target.value})} placeholder="finance@client.com"/>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-black text-slate-700 mb-1.5 uppercase text-[10px] tracking-widest">Currency Unit</label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button onClick={() => setNewInvoice({...newInvoice, currency: 'USD'})} className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${newInvoice.currency === 'USD' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400'}`}>USD ($)</button>
                  <button onClick={() => setNewInvoice({...newInvoice, currency: 'INR'})} className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${newInvoice.currency === 'INR' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400'}`}>INR (₹)</button>
                </div>
              </div>
              <Input label="Line Item Total" type="number" value={newInvoice.amount} onChange={e => setNewInvoice({...newInvoice, amount: Number(e.target.value)})} icon={newInvoice.currency === 'INR' ? <IndianRupee size={14}/> : <DollarSign size={14}/>} />
           </div>

           <div>
             <label className="block text-sm font-black text-slate-700 mb-1.5 uppercase text-[10px] tracking-widest">Initial Ledger Status</label>
             <select 
               className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700"
               value={newInvoice.status}
               onChange={e => setNewInvoice({...newInvoice, status: e.target.value as any})}
             >
               <option value="draft">Internal Draft</option>
               <option value="sent">Awaiting Payment (Sent)</option>
               <option value="paid">Settled (Paid)</option>
             </select>
           </div>

           <div className="flex justify-end pt-4 border-t border-slate-50">
             <Button onClick={handleSave} className="px-10">Commit Record</Button>
           </div>
         </div>
      </Modal>
    </div>
  );
};

const StatCard = ({ title, amount, color, icon }: { title: string, amount: { usd: number, inr: number }, color: string, icon: React.ReactNode }) => (
  <Card className={`border-l-4 p-6 ${color === 'yellow' ? 'border-l-yellow-400' : color === 'green' ? 'border-l-brand-500' : 'border-l-red-500'}`}>
     <div className="flex justify-between items-start mb-4">
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{title}</p>
        <div className={`p-2 rounded-lg ${color === 'yellow' ? 'bg-yellow-50 text-yellow-600' : color === 'green' ? 'bg-brand-50 text-brand-600' : 'bg-red-50 text-red-600'}`}>
           {icon}
        </div>
     </div>
     <div className="space-y-1">
        <p className="text-2xl font-black text-slate-900">${amount.usd.toLocaleString()}</p>
        <p className="text-lg font-black text-slate-400">₹{amount.inr.toLocaleString()}</p>
     </div>
  </Card>
);

export default AdminInvoices;
