import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Service } from '../../types';
import Button from '../Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import { Loader2, Edit2, Trash2, Save, Plus, X, Search } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { iconMap, availableIcons } from '../../utils/iconMap';

const AdminServices: React.FC = () => {
  const { success, error: showError } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentService, setCurrentService] = useState<Partial<Service>>({
    title: '',
    description: '',
    category: 'AI',
    icon_name: 'Bot',
    features: []
  });
  const [featureInput, setFeatureInput] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: true });
      if (error) throw error;
      setServices(data as any[] || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveService = async () => {
    if (!currentService.title || !currentService.description) {
      showError('Title and Description are required');
      return;
    }

    try {
      const serviceData = {
        title: currentService.title,
        description: currentService.description,
        category: currentService.category,
        icon_name: currentService.icon_name,
        features: currentService.features
      };

      if (currentService.id) {
        const { error } = await supabase.from('services').update(serviceData).eq('id', currentService.id);
        if (error) throw error;
        success('Service updated successfully');
      } else {
        const { error } = await supabase.from('services').insert([serviceData]);
        if (error) throw error;
        success('Service created successfully');
      }
      setIsModalOpen(false);
      fetchServices();
      resetForm();
    } catch (error) {
      console.error('Error saving service:', error);
      showError('Failed to save service.');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
      setServices(prev => prev.filter(s => s.id !== id));
      success('Service deleted');
    } catch (error) {
      console.error('Error deleting service:', error);
      showError('Failed to delete service');
    }
  };

  const resetForm = () => {
    setCurrentService({
      title: '',
      description: '',
      category: 'AI',
      icon_name: 'Bot',
      features: []
    });
    setFeatureInput('');
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setCurrentService(service);
    setIsModalOpen(true);
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setCurrentService(prev => ({ ...prev, features: [...(prev.features || []), featureInput.trim()] }));
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setCurrentService(prev => ({ ...prev, features: prev.features?.filter((_, i) => i !== index) }));
  };

  const filteredServices = services.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative w-full md:w-80">
           <Input 
             placeholder="Search services..." 
             value={searchTerm} 
             onChange={(e) => setSearchTerm(e.target.value)}
             icon={<Search size={18} />}
           />
        </div>
        <Button onClick={openCreateModal} leftIcon={<Plus size={18} />}>
          Add Service
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>
      ) : filteredServices.length === 0 ? (
        <Card className="text-center py-20 text-slate-400">
          <p>No services found.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map(service => {
            const Icon = iconMap[service.icon_name || 'Zap'] || iconMap['Zap'];
            return (
              <Card key={service.id} className="hover:border-brand-300 transition-colors flex flex-col h-full" noPadding>
                <div className="p-6 flex flex-col flex-grow">
                   <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600">
                        <Icon size={20} />
                      </div>
                      <Badge variant="neutral">{service.category}</Badge>
                   </div>
                   <h3 className="font-bold text-slate-900 text-lg mb-2">{service.title}</h3>
                   <p className="text-sm text-slate-500 line-clamp-3 mb-4 flex-grow">{service.description}</p>
                   
                   <div className="flex flex-wrap gap-1 mb-6">
                     {service.features?.slice(0, 2).map((f, i) => (
                       <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{f}</span>
                     ))}
                     {(service.features?.length || 0) > 2 && <span className="text-[10px] text-slate-400 px-1 py-1">+{service.features.length - 2}</span>}
                   </div>

                   <div className="flex gap-2 pt-4 border-t border-slate-50 mt-auto">
                     <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditModal(service)}>Edit</Button>
                     <Button variant="danger" size="sm" onClick={() => handleDeleteService(service.id)}><Trash2 size={16} /></Button>
                   </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentService.id ? "Edit Service" : "Add New Service"}
        size="lg"
      >
        <div className="space-y-6">
           <Input 
             label="Service Title" 
             value={currentService.title}
             onChange={e => setCurrentService({...currentService, title: e.target.value})}
             placeholder="e.g. AI Automation"
           />
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
               <select 
                 className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white"
                 value={currentService.category}
                 onChange={e => setCurrentService({...currentService, category: e.target.value as any})}
               >
                 <option>AI</option>
                 <option>Web</option>
                 <option>Automation</option>
                 <option>Branding</option>
               </select>
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1.5">Icon</label>
               <select 
                 className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white"
                 value={currentService.icon_name}
                 onChange={e => setCurrentService({...currentService, icon_name: e.target.value})}
               >
                 {availableIcons.map(icon => (
                   <option key={icon} value={icon}>{icon}</option>
                 ))}
               </select>
             </div>
           </div>

           {/* Icon Preview */}
           <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <label className="block text-sm font-medium text-slate-700 mb-3">Icon Preview & Selection</label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                {availableIcons.map(iconName => {
                  const Icon = iconMap[iconName];
                  const isSelected = currentService.icon_name === iconName;
                  return (
                    <button
                      key={iconName}
                      onClick={() => setCurrentService({...currentService, icon_name: iconName})}
                      className={`p-2 rounded-lg transition-all ${isSelected ? 'bg-brand-600 text-white shadow-md scale-110' : 'bg-white text-slate-500 hover:bg-slate-200'}`}
                      title={iconName}
                    >
                      <Icon size={20} />
                    </button>
                  );
                })}
              </div>
           </div>

           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
             <textarea 
               className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
               rows={3}
               value={currentService.description}
               onChange={e => setCurrentService({...currentService, description: e.target.value})}
               placeholder="Describe the service..."
             />
           </div>

           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1.5">Features (Bullet Points)</label>
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
               {currentService.features?.map((feature, idx) => (
                 <Badge key={idx} variant="neutral" className="pl-3 pr-1 py-1 bg-white">
                   {feature}
                   <button onClick={() => handleRemoveFeature(idx)} className="ml-2 text-slate-400 hover:text-red-500"><X size={12}/></button>
                 </Badge>
               ))}
             </div>
           </div>

           <div className="flex justify-end pt-4 border-t border-slate-100">
             <Button onClick={handleSaveService} leftIcon={<Save size={18}/>}>Save Service</Button>
           </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminServices;