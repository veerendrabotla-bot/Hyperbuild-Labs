import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Invoice } from '../../types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { Plus, Download, FileText, Loader2, DollarSign, Filter, RefreshCw, Mail, Check } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import emailjs from '@emailjs/browser';
import { EMAILJS_SERVICE_ID, EMAILJS_INVOICE_TEMPLATE_ID, EMAILJS_PUBLIC_KEY } from '../../constants';

const AdminInvoices: React.FC = () => {
  const { success, error: showError } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({ client_name: '', amount: 0, status: 'draft' });
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
      success('Invoice created');
      setIsModalOpen(false);
      fetchInvoices();
      setNewInvoice({ client_name: '', amount: 0, status: 'draft' });
    } catch (err: any) {
      showError(err.message);
    }
  };

  const updateStatus = async (id: string, status: Invoice['status']) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
    await supabase.from('invoices').update({ status }).eq('id', id);
    success('Status updated');
  };

  const sendInvoiceEmail = async (invoice: Invoice) => {
    if (!invoice.client_email) {
      showError('No client email on file for this invoice');
      return;
    }
    
    setSendingEmailId(invoice.id);
    try {
      if (EMAILJS_SERVICE_ID === 'service_placeholder' || !EMAILJS_INVOICE_TEMPLATE_ID) {
        throw new Error("Email service not configured (Demo Mode)");
      }

      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_INVOICE_TEMPLATE_ID, {
        to_name: invoice.client_name,
        to_email: invoice.client_email,
        amount: `$${invoice.amount.toLocaleString()}`,
        status: invoice.status.toUpperCase(),
        due_date: invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'Upon Receipt',
        invoice_link: `${window.location.origin}/#/invoices/${invoice.id}` // Hypothetical public link
      });

      success(`Invoice sent to ${invoice.client_email}`);
      
      // Auto update status to Sent if it was Draft
      if (invoice.status === 'draft') {
        updateStatus(invoice.id, 'sent');
      }

    } catch (err: any) {
      console.error(err);
      showError('Failed to send email: ' + (err.text || err.message));
    } finally {
      setSendingEmailId(null);
    }
  };

  const exportCSV = () => {
    const headers = ['Client', 'Amount', 'Status', 'Date', 'Email'];
    const csvContent = [
      headers.join(','),
      ...invoices.map(inv => 
        `"${inv.client_name}",${inv.amount},${inv.status},${new Date(inv.created_at).toLocaleDateString()},"${inv.client_email || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoices_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredInvoices = filterStatus === 'all' 
    ? invoices 
    : invoices.filter(inv => inv.status === filterStatus);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
         <div>
           <h2 className="text-lg font-bold text-slate-800">Financials & Invoices</h2>
           <p className="text-sm text-slate-500">Track pending and paid invoices.</p>
         </div>
         <div className="flex gap-2">
            <Button variant="outline" onClick={exportCSV} leftIcon={<Download size={16}/>}>Export CSV</Button>
            <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus size={16}/>}>Create Invoice</Button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="flex items-center justify-between p-6 bg-white border-l-4 border-l-yellow-400">
           <div>
             <p className="text-slate-500 text-sm font-medium">Pending Revenue</p>
             <h3 className="text-2xl font-bold text-slate-900">
               ${invoices.filter(i => i.status === 'sent').reduce((acc, curr) => acc + Number(curr.amount), 0).toLocaleString()}
             </h3>
           </div>
           <div className="bg-yellow-50 p-3 rounded-full text-yellow-600"><DollarSign size={24}/></div>
        </Card>
        <Card className="flex items-center justify-between p-6 bg-white border-l-4 border-l-green-500">
           <div>
             <p className="text-slate-500 text-sm font-medium">Collected (Paid)</p>
             <h3 className="text-2xl font-bold text-green-600">
               ${invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + Number(curr.amount), 0).toLocaleString()}
             </h3>
           </div>
           <div className="bg-green-50 p-3 rounded-full text-green-600"><DollarSign size={24}/></div>
        </Card>
        <Card className="flex items-center justify-between p-6 bg-white border-l-4 border-l-red-400">
           <div>
             <p className="text-slate-500 text-sm font-medium">Overdue</p>
             <h3 className="text-2xl font-bold text-red-600">
               ${invoices.filter(i => i.status === 'overdue').reduce((acc, curr) => acc + Number(curr.amount), 0).toLocaleString()}
             </h3>
           </div>
           <div className="bg-red-50 p-3 rounded-full text-red-600"><DollarSign size={24}/></div>
        </Card>
      </div>

      <Card noPadding>
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
           <div className="flex items-center gap-2">
             <Filter size={16} className="text-slate-400"/>
             <select 
               className="bg-transparent text-sm font-medium text-slate-600 focus:outline-none"
               value={filterStatus}
               onChange={(e) => setFilterStatus(e.target.value)}
             >
               <option value="all">All Statuses</option>
               <option value="draft">Draft</option>
               <option value="sent">Sent</option>
               <option value="paid">Paid</option>
               <option value="overdue">Overdue</option>
             </select>
           </div>
           <button onClick={fetchInvoices} className="text-slate-400 hover:text-brand-600 transition-colors"><RefreshCw size={16}/></button>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-brand-600"/></div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {inv.client_name}
                    {inv.client_email && <div className="text-xs text-slate-400 font-normal">{inv.client_email}</div>}
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-mono">${Number(inv.amount).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <Badge variant={inv.status === 'paid' ? 'success' : inv.status === 'overdue' ? 'danger' : inv.status === 'sent' ? 'warning' : 'neutral'}>
                      {inv.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(inv.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Email Button */}
                      {inv.client_email && (
                        <button 
                          onClick={() => sendInvoiceEmail(inv)}
                          disabled={sendingEmailId === inv.id}
                          className="p-1.5 bg-slate-100 text-slate-600 rounded hover:bg-brand-50 hover:text-brand-600 transition-colors disabled:opacity-50"
                          title="Send Invoice via Email"
                        >
                          {sendingEmailId === inv.id ? <Loader2 size={16} className="animate-spin"/> : <Mail size={16} />}
                        </button>
                      )}
                      
                      {/* Status Toggles */}
                      {inv.status !== 'paid' && (
                        <button 
                          onClick={() => updateStatus(inv.id, 'paid')}
                          className="p-1.5 bg-green-50 text-green-700 rounded hover:bg-green-100"
                          title="Mark Paid"
                        >
                          <Check size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No invoices found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Generate Invoice">
         <div className="space-y-4">
           <Input label="Client Name" value={newInvoice.client_name} onChange={e => setNewInvoice({...newInvoice, client_name: e.target.value})} placeholder="Acme Corp"/>
           <Input label="Client Email (Optional)" type="email" value={newInvoice.client_email} onChange={e => setNewInvoice({...newInvoice, client_email: e.target.value})} placeholder="billing@acme.com"/>
           <Input label="Amount ($)" type="number" value={newInvoice.amount} onChange={e => setNewInvoice({...newInvoice, amount: Number(e.target.value)})} placeholder="5000"/>
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
             <select 
               className="w-full px-4 py-2 border rounded-lg"
               value={newInvoice.status}
               onChange={e => setNewInvoice({...newInvoice, status: e.target.value as any})}
             >
               <option value="draft">Draft</option>
               <option value="sent">Sent</option>
               <option value="paid">Paid</option>
             </select>
           </div>
           <div className="flex justify-end pt-4">
             <Button onClick={handleSave}>Create Record</Button>
           </div>
         </div>
      </Modal>
    </div>
  );
};

export default AdminInvoices;