import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Invoice } from '../../types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { Plus, Download, FileText, Loader2, DollarSign } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const AdminInvoices: React.FC = () => {
  const { success, error: showError } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({ client_name: '', amount: 0, status: 'draft' });

  useEffect(() => {
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
    } catch (err: any) {
      showError(err.message);
    }
  };

  const updateStatus = async (id: string, status: Invoice['status']) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
    await supabase.from('invoices').update({ status }).eq('id', id);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
         <div>
           <h2 className="text-lg font-bold text-slate-800">Financials & Invoices</h2>
           <p className="text-sm text-slate-500">Track pending and paid invoices.</p>
         </div>
         <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus size={16}/>}>Create Invoice</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="flex items-center justify-between p-6 bg-white">
           <div>
             <p className="text-slate-500 text-sm font-medium">Pending Revenue</p>
             <h3 className="text-2xl font-bold text-slate-900">
               ${invoices.filter(i => i.status === 'sent').reduce((acc, curr) => acc + Number(curr.amount), 0).toLocaleString()}
             </h3>
           </div>
           <div className="bg-yellow-100 p-3 rounded-full text-yellow-600"><DollarSign size={24}/></div>
        </Card>
        <Card className="flex items-center justify-between p-6 bg-white">
           <div>
             <p className="text-slate-500 text-sm font-medium">Collected (Paid)</p>
             <h3 className="text-2xl font-bold text-green-600">
               ${invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + Number(curr.amount), 0).toLocaleString()}
             </h3>
           </div>
           <div className="bg-green-100 p-3 rounded-full text-green-600"><DollarSign size={24}/></div>
        </Card>
      </div>

      <Card noPadding>
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
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{inv.client_name}</td>
                  <td className="px-6 py-4 text-slate-600">${Number(inv.amount).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <Badge variant={inv.status === 'paid' ? 'success' : inv.status === 'overdue' ? 'danger' : 'warning'}>
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(inv.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {inv.status !== 'paid' && <Button size="sm" variant="ghost" onClick={() => updateStatus(inv.id, 'paid')}>Mark Paid</Button>}
                      <Button size="sm" variant="outline" leftIcon={<Download size={14}/>}>PDF</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No invoices generated yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Generate Invoice">
         <div className="space-y-4">
           <Input label="Client Name" value={newInvoice.client_name} onChange={e => setNewInvoice({...newInvoice, client_name: e.target.value})} placeholder="Acme Corp"/>
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
             <Button onClick={handleSave}>Create</Button>
           </div>
         </div>
      </Modal>
    </div>
  );
};

export default AdminInvoices;