import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { PricingTier } from '../../types';
import Button from '../Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import { Loader2, Edit2, Trash2, Save, Plus, DollarSign, Check, X } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const AdminPricing: React.FC = () => {
  const { success, error: showError } = useToast();
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [currentTier, setCurrentTier] = useState<Partial<PricingTier>>({
    name: '',
    price: '',
    description: '',
    features: [],
    is_recommended: false,
    order_index: 0
  });
  const [featureInput, setFeatureInput] = useState('');

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('pricing_tiers').select('*').order('order_index', { ascending: true });
      if (error) throw error;
      setTiers(data as PricingTier[] || []);
    } catch (error) {
      console.error('Error fetching pricing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentTier.name || !currentTier.price) {
      showError('Name and Price are required');
      return;
    }

    try {
      if (currentTier.id) {
        const { error } = await supabase.from('pricing_tiers').update(currentTier).eq('id', currentTier.id);
        if (error) throw error;
        success('Pricing updated');
      } else {
        const { error } = await supabase.from('pricing_tiers').insert([currentTier]);
        if (error) throw error;
        success('Pricing tier added');
      }
      setIsModalOpen(false);
      fetchPricing();
      resetForm();
    } catch (error) {
      console.error('Error saving pricing:', error);
      showError('Failed to save pricing.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      const { error } = await supabase.from('pricing_tiers').delete().eq('id', id);
      if (error) throw error;
      setTiers(prev => prev.filter(t => t.id !== id));
      success('Tier deleted');
    } catch (error) {
      console.error('Error deleting:', error);
      showError('Failed to delete');
    }
  };

  const resetForm = () => {
    setCurrentTier({
      name: '',
      price: '',
      description: '',
      features: [],
      is_recommended: false,
      order_index: tiers.length
    });
    setFeatureInput('');
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (tier: PricingTier) => {
    setCurrentTier(tier);
    setIsModalOpen(true);
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setCurrentTier(prev => ({ ...prev, features: [...(prev.features || []), featureInput.trim()] }));
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setCurrentTier(prev => ({ ...prev, features: prev.features?.filter((_, i) => i !== index) }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-lg font-bold text-slate-800">Pricing Packages</h2>
           <p className="text-sm text-slate-500">Manage your service packages and pricing.</p>
        </div>
        <Button onClick={openCreateModal} leftIcon={<Plus size={18} />}>
          Add Package
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>
      ) : tiers.length === 0 ? (
        <Card className="text-center py-20 text-slate-400">
          <p>No pricing tiers found.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map(tier => (
            <div key={tier.id} className={`relative flex flex-col p-6 rounded-2xl bg-white border shadow-sm transition-all hover:shadow-lg ${tier.is_recommended ? 'border-brand-500 ring-1 ring-brand-500' : 'border-slate-200'}`}>
               {tier.is_recommended && (
                 <span className="absolute top-0 right-0 bg-brand-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg uppercase">
                   Recommended
                 </span>
               )}
               
               <div className="flex justify-between items-start mb-4">
                 <div>
                   <h3 className="text-lg font-bold text-slate-900">{tier.name}</h3>
                   <div className="text-2xl font-extrabold text-slate-800">{tier.price}</div>
                 </div>
                 <div className="flex gap-1">
                    <button onClick={() => openEditModal(tier)} className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><Edit2 size={16}/></button>
                    <button onClick={() => handleDelete(tier.id!)} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 size={16}/></button>
                 </div>
               </div>
               
               <p className="text-sm text-slate-500 mb-6 min-h-[40px]">{tier.description}</p>
               
               <div className="space-y-2 flex-grow">
                 {tier.features.slice(0, 4).map((feat, i) => (
                   <div key={i} className="flex items-center text-xs text-slate-600">
                     <Check size={12} className="text-brand-500 mr-2 flex-shrink-0" /> {feat}
                   </div>
                 ))}
                 {tier.features.length > 4 && <div className="text-xs text-slate-400 pl-5">+{tier.features.length - 4} more features</div>}
               </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentTier.id ? "Edit Package" : "Add Package"}
      >
        <div className="space-y-4">
           <div className="grid grid-cols-2 gap-4">
             <Input 
               label="Package Name" 
               value={currentTier.name}
               onChange={e => setCurrentTier({...currentTier, name: e.target.value})}
               placeholder="Starter"
             />
             <Input 
               label="Price Display" 
               value={currentTier.price}
               onChange={e => setCurrentTier({...currentTier, price: e.target.value})}
               placeholder="$999"
               icon={<DollarSign size={16}/>}
             />
           </div>
           
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
             <textarea 
               className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
               rows={2}
               value={currentTier.description}
               onChange={e => setCurrentTier({...currentTier, description: e.target.value})}
               placeholder="Brief summary..."
             />
           </div>

           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1.5">Features</label>
             <div className="flex gap-2 mb-2">
               <Input 
                 value={featureInput}
                 onChange={e => setFeatureInput(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && handleAddFeature()}
                 placeholder="Add a feature..."
                 className="flex-1"
               />
               <Button onClick={handleAddFeature} variant="secondary">Add</Button>
             </div>
             <div className="flex flex-wrap gap-2">
               {currentTier.features?.map((feature, idx) => (
                 <Badge key={idx} variant="neutral" className="pl-3 pr-1 py-1 bg-white">
                   {feature}
                   <button onClick={() => handleRemoveFeature(idx)} className="ml-2 text-slate-400 hover:text-red-500"><X size={12}/></button>
                 </Badge>
               ))}
             </div>
           </div>

           <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="rec" 
                  className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                  checked={currentTier.is_recommended}
                  onChange={e => setCurrentTier({...currentTier, is_recommended: e.target.checked})}
                />
                <label htmlFor="rec" className="ml-2 text-sm text-slate-700">Recommended Plan</label>
              </div>
              <div className="flex items-center gap-2">
                 <label className="text-sm text-slate-700">Sort Order:</label>
                 <input 
                   type="number" 
                   className="w-16 px-2 py-1 border rounded text-sm"
                   value={currentTier.order_index}
                   onChange={e => setCurrentTier({...currentTier, order_index: parseInt(e.target.value)})}
                 />
              </div>
           </div>

           <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
             <Button onClick={handleSave} leftIcon={<Save size={18}/>}>Save Package</Button>
           </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminPricing;