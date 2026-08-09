import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Testimonial } from '../../types';
import Button from '../Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { Loader2, Edit2, Trash2, Save, Plus, User, Quote } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { TESTIMONIALS } from '../../constants';

const AdminTestimonials: React.FC = () => {
  const { success, error: showError } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [currentTestimonial, setCurrentTestimonial] = useState<Partial<Testimonial>>({
    name: '',
    role: '',
    company: '',
    content: '',
    avatar: 'https://ui-avatars.com/api/?background=random'
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setTestimonials(data as any[] || []);
    } catch (error) {
      console.warn('Error fetching testimonials, falling back to static testimonials:', error);
      setTestimonials(TESTIMONIALS);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentTestimonial.name || !currentTestimonial.content) {
      showError('Name and Content are required');
      return;
    }

    // Auto-generate avatar if empty
    const testimonialData = {
        ...currentTestimonial,
        avatar: currentTestimonial.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentTestimonial.name)}&background=random`
    };

    try {
      if (currentTestimonial.id) {
        const { error } = await supabase.from('testimonials').update(testimonialData).eq('id', currentTestimonial.id);
        if (error) throw error;
        success('Testimonial updated');
      } else {
        const { error } = await supabase.from('testimonials').insert([testimonialData]);
        if (error) throw error;
        success('Testimonial added');
      }
      setIsModalOpen(false);
      fetchTestimonials();
      resetForm();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      showError('Failed to save testimonial.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
      setTestimonials(prev => prev.filter(t => t.id !== id));
      success('Testimonial deleted');
    } catch (error) {
      console.error('Error deleting:', error);
      showError('Failed to delete');
    }
  };

  const resetForm = () => {
    setCurrentTestimonial({
      name: '',
      role: '',
      company: '',
      content: '',
      avatar: 'https://ui-avatars.com/api/?background=random'
    });
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (t: Testimonial) => {
    setCurrentTestimonial(t);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-lg font-bold text-slate-800">Testimonials</h2>
           <p className="text-sm text-slate-500">Manage client success stories.</p>
        </div>
        <Button onClick={openCreateModal} leftIcon={<Plus size={18} />}>
          Add Testimonial
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>
      ) : testimonials.length === 0 ? (
        <Card className="text-center py-20 text-slate-400">
          <p>No testimonials found.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map(t => (
            <Card key={t.id} className="relative group">
               <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                     <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full mr-4 object-cover bg-slate-100" />
                     <div>
                       <h4 className="font-bold text-slate-900">{t.name}</h4>
                       <p className="text-sm text-slate-500">{t.role}{t.company && `, ${t.company}`}</p>
                     </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => openEditModal(t)} className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><Edit2 size={16}/></button>
                     <button onClick={() => handleDelete(t.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 size={16}/></button>
                  </div>
               </div>
               <div className="relative">
                 <Quote size={20} className="text-brand-100 absolute -top-2 -left-2 transform -scale-x-100" />
                 <p className="text-slate-600 italic text-sm pl-4 leading-relaxed relative z-10">"{t.content}"</p>
               </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentTestimonial.id ? "Edit Testimonial" : "Add Testimonial"}
      >
        <div className="space-y-4">
           <div className="grid grid-cols-2 gap-4">
             <Input 
               label="Client Name" 
               value={currentTestimonial.name}
               onChange={e => setCurrentTestimonial({...currentTestimonial, name: e.target.value})}
               placeholder="Jane Doe"
             />
             <Input 
               label="Avatar URL (Optional)" 
               value={currentTestimonial.avatar}
               onChange={e => setCurrentTestimonial({...currentTestimonial, avatar: e.target.value})}
               placeholder="https://..."
               icon={<User size={16}/>}
             />
           </div>
           <div className="grid grid-cols-2 gap-4">
             <Input 
               label="Role" 
               value={currentTestimonial.role}
               onChange={e => setCurrentTestimonial({...currentTestimonial, role: e.target.value})}
               placeholder="CEO"
             />
             <Input 
               label="Company" 
               value={currentTestimonial.company}
               onChange={e => setCurrentTestimonial({...currentTestimonial, company: e.target.value})}
               placeholder="Acme Corp"
             />
           </div>
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1.5">Testimonial Content</label>
             <textarea 
               className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
               rows={4}
               value={currentTestimonial.content || ''}
               onChange={e => setCurrentTestimonial({...currentTestimonial, content: e.target.value})}
               placeholder="They did an amazing job..."
             />
           </div>
           <div className="flex justify-end pt-4">
             <Button onClick={handleSave} leftIcon={<Save size={18}/>}>Save</Button>
           </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminTestimonials;