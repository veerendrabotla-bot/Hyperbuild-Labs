import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { FaqItem } from '../../types';
import Button from '../Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { Loader2, Edit2, Trash2, Save, Plus, HelpCircle } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const AdminFAQ: React.FC = () => {
  const { success, error: showError } = useToast();
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [currentFaq, setCurrentFaq] = useState<Partial<FaqItem>>({
    question: '',
    answer: '',
    order_index: 0
  });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('faqs').select('*').order('order_index', { ascending: true });
      if (error) throw error;
      setFaqs(data as FaqItem[] || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentFaq.question || !currentFaq.answer) {
      showError('Question and Answer are required');
      return;
    }

    try {
      if (currentFaq.id) {
        const { error } = await supabase.from('faqs').update(currentFaq).eq('id', currentFaq.id);
        if (error) throw error;
        success('FAQ updated');
      } else {
        const { error } = await supabase.from('faqs').insert([currentFaq]);
        if (error) throw error;
        success('FAQ added');
      }
      setIsModalOpen(false);
      fetchFaqs();
      resetForm();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      showError('Failed to save FAQ.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      const { error } = await supabase.from('faqs').delete().eq('id', id);
      if (error) throw error;
      setFaqs(prev => prev.filter(f => f.id !== id));
      success('FAQ deleted');
    } catch (error) {
      console.error('Error deleting:', error);
      showError('Failed to delete');
    }
  };

  const resetForm = () => {
    setCurrentFaq({
      question: '',
      answer: '',
      order_index: faqs.length
    });
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (faq: FaqItem) => {
    setCurrentFaq(faq);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-lg font-bold text-slate-800">Frequently Asked Questions</h2>
           <p className="text-sm text-slate-500">Manage the FAQs displayed on the Contact page.</p>
        </div>
        <Button onClick={openCreateModal} leftIcon={<Plus size={18} />}>
          Add FAQ
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>
      ) : faqs.length === 0 ? (
        <Card className="text-center py-20 text-slate-400">
          <p>No FAQs found.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {faqs.map(faq => (
            <Card key={faq.id} className="relative group hover:shadow-md transition-shadow" noPadding>
               <div className="p-4 flex items-start gap-4">
                  <div className="bg-brand-50 p-2 rounded-lg text-brand-600 mt-1">
                    <HelpCircle size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 mb-1">{faq.question}</h4>
                    <p className="text-sm text-slate-600">{faq.answer}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => openEditModal(faq)} className="p-2 hover:bg-slate-100 rounded text-slate-500"><Edit2 size={16}/></button>
                     <button onClick={() => handleDelete(faq.id!)} className="p-2 hover:bg-red-50 rounded text-red-500"><Trash2 size={16}/></button>
                  </div>
               </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentFaq.id ? "Edit FAQ" : "Add FAQ"}
      >
        <div className="space-y-4">
           <Input 
             label="Question" 
             value={currentFaq.question}
             onChange={e => setCurrentFaq({...currentFaq, question: e.target.value})}
             placeholder="e.g. How long does a project take?"
           />
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1.5">Answer</label>
             <textarea 
               className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
               rows={4}
               value={currentFaq.answer}
               onChange={e => setCurrentFaq({...currentFaq, answer: e.target.value})}
               placeholder="Enter the answer..."
             />
           </div>
           <Input 
             label="Sort Order" 
             type="number"
             value={currentFaq.order_index}
             onChange={e => setCurrentFaq({...currentFaq, order_index: parseInt(e.target.value)})}
           />
           <div className="flex justify-end pt-4">
             <Button onClick={handleSave} leftIcon={<Save size={18}/>}>Save</Button>
           </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminFAQ;