
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { PricingTier } from '../../types';
import Button from '../Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import { Loader2, Edit2, Trash2, Save, Plus, DollarSign, Check, X, IndianRupee } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { PRICING } from '../../constants';

const AdminPricing: React.FC = () => {
  const { success, error: showError } = useToast();
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [currentTier, setCurrentTier] = useState<Partial<PricingTier>>({
    name: '',
    price: '',
    currency: 'USD',
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
      console.warn('Error fetching pricing, falling back to static pricing:', error);
      setTiers(PRICING);
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
        success('Catalog updated');
      } else {
        const { error } = await supabase.from('pricing_tiers').insert([currentTier]);
        if (error) throw error;
        success('New tier deployed');
      }
      setIsModalOpen(false);
      fetchPricing();
      resetForm();
    } catch (error) {
      showError('Save failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this tier permanently?')) return;
    try {
      const { error } = await supabase.from('pricing_tiers').delete().eq('id', id);
      if (error) throw error;
      setTiers(prev => prev.filter(t => t.id !== id));
      success('Purged');
    } catch (error) {
      showError('Delete failed');
    }
  };

  const resetForm = () => {
    setCurrentTier({
      name: '',
      price: '',
      currency: 'USD',
      description: '',
      features: [],
      is_recommended: false,
      order_index: tiers.length
    });
    setFeatureInput('');
  };

  const openCreateModal = () => { resetForm(); setIsModalOpen(true); };
  const openEditModal = (tier: PricingTier) => { setCurrentTier(tier); setIsModalOpen(true); };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setCurrentTier(prev => ({ ...prev, features: [...(prev.features || []), featureInput.trim()] }));
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setCurrentTier(prev => ({ ...prev, features: prev.features?.filter((_, i) => i !== index) }));
  };

  const getSymbol = (c: string | undefined) => c === 'INR' ? '₹' : '$';

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-2xl font-black text-slate-900 tracking-tight">Tier Configuration</h2>
           <p className="text-sm text-slate-500 font-medium">Define service modules and global pricing metrics.</p>
        </div>
        <Button onClick={openCreateModal} leftIcon={<Plus size={18} />}>
          New Package
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-brand-600" /></div>
      ) : tiers.length === 0 ? (
        <Card className="text-center py-20 text-slate-400">
          <p>No tiers configured.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map(tier => (
            <div key={tier.id} className={`relative flex flex-col p-8 rounded-3xl bg-white border shadow-sm transition-all hover:shadow-xl group ${tier.is_recommended ? 'border-brand-500 ring-1 ring-brand-500' : 'border-slate-200'}`}>
               {tier.is_recommended && (
                 <span className="absolute top-0 right-0 bg-brand-600 text-white text-[10px] font-black px-3 py-1.5 rounded-bl-2xl rounded-tr-3xl uppercase tracking-widest">
                   Featured
                 </span>
               )}
               
               <div className="flex justify-between items-start mb-6">
                 <div>
                   <h3 className="text-xl font-black text-slate-900">{tier.name}</h3>
                   <div className="text-3xl font-black text-brand-600 mt-1">
                     <span className="text-lg mr-0.5">{getSymbol(tier.currency)}</span>
                     {tier.price}
                   </div>
                 </div>
                 <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditModal(tier)} className="p-2 bg-slate-50 hover:bg-brand-50 rounded-xl text-slate-400 hover:text-brand-600 transition-all"><Edit2 size={16}/></button>
                    <button onClick={() => handleDelete(tier.id!)} className="p-2 bg-slate-50 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                 </div>
               </div>
               
               <p className="text-sm text-slate-500 mb-8 font-medium line-clamp-2">{tier.description}</p>
               
               <div className="space-y-3 flex-grow border-t border-slate-50 pt-6">
                 {tier.features.slice(0, 5).map((feat, i) => (
                   <div key={i} className="flex items-start text-[11px] font-bold text-slate-600 uppercase tracking-tight">
                     <Check size={14} className="text-brand-500 mr-2 flex-shrink-0 mt-0.5" /> {feat}
                   </div>
                 ))}
                 {tier.features.length > 5 && <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-6">+{tier.features.length - 5} Assets</div>}
               </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Issue Tier Specifications" size="lg">
        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Input label="Tier Label" value={currentTier.name} onChange={e => setCurrentTier({...currentTier, name: e.target.value})} placeholder="e.g. Growth Pack" />
             <div>
                <label className="block text-sm font-black text-slate-700 mb-1.5 uppercase text-[10px] tracking-widest">Base Currency</label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button onClick={() => setCurrentTier({...currentTier, currency: 'USD'})} className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${currentTier.currency === 'USD' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400'}`}>USD ($)</button>
                  <button onClick={() => setCurrentTier({...currentTier, currency: 'INR'})} className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${currentTier.currency === 'INR' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400'}`}>INR (₹)</button>
                </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Input label="Price Amount (Numeric or 'Custom')" value={currentTier.price} onChange={e => setCurrentTier({...currentTier, price: e.target.value})} placeholder="2499" icon={currentTier.currency === 'INR' ? <IndianRupee size={14}/> : <DollarSign size={14}/>} />
             <Input label="Rank (Display Order)" type="number" value={currentTier.order_index} onChange={e => setCurrentTier({...currentTier, order_index: parseInt(e.target.value)})} />
           </div>
           
           <div>
             <label className="block text-sm font-black text-slate-700 mb-1.5 uppercase text-[10px] tracking-widest">Market Value Proposition</label>
             <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium text-slate-700 focus:border-brand-400" rows={2} value={currentTier.description || ''} onChange={e => setCurrentTier({...currentTier, description: e.target.value})} placeholder="Describe target audience..." />
           </div>

           <div>
             <label className="block text-sm font-black text-slate-700 mb-1.5 uppercase text-[10px] tracking-widest">Included Assets</label>
             <div className="flex gap-2 mb-3">
               <Input value={featureInput} onChange={e => setFeatureInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddFeature()} placeholder="Enter deliverables..." className="flex-1" />
               <Button onClick={handleAddFeature} variant="secondary">Append</Button>
             </div>
             <div className="flex flex-wrap gap-2">
               {currentTier.features?.map((feature, idx) => (
                 <Badge key={idx} variant="neutral" className="pl-4 pr-2 py-2 bg-white border-slate-200">
                   {feature}
                   <button onClick={() => handleRemoveFeature(idx)} className="ml-3 p-0.5 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-500 transition-all"><X size={14}/></button>
                 </Badge>
               ))}
             </div>
           </div>

           <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
              <input type="checkbox" id="rec-check" className="w-5 h-5 text-brand-600 rounded-lg border-slate-300 focus:ring-brand-500" checked={currentTier.is_recommended} onChange={e => setCurrentTier({...currentTier, is_recommended: e.target.checked})} />
              <label htmlFor="rec-check" className="text-sm font-bold text-slate-700">Flag as "Featured Solution"</label>
           </div>

           <div className="flex justify-end pt-6">
             <Button onClick={handleSave} className="px-12">Commit Specifications</Button>
           </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminPricing;
