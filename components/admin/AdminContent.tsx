import React, { useState } from 'react';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';
import Card from '../ui/Card';
import Button from '../Button';
import Input from '../ui/Input';
import { Save, Globe, Phone, Mail, MapPin, MessageSquare, Layout } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const AdminContent: React.FC = () => {
  const { settings, updateSetting } = useSiteSettings();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);

  // Local state for form management
  const [formData, setFormData] = useState(settings);

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save all keys
      const promises = Object.entries(formData).map(([key, value]) => updateSetting(key, value));
      await Promise.all(promises);
      success('Site content updated successfully');
    } catch (err: any) {
      showError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-lg font-bold text-slate-800">Site Content (CMS)</h2>
           <p className="text-sm text-slate-500">Edit contact info, hero text, and global settings.</p>
        </div>
        <Button onClick={handleSave} isLoading={loading} leftIcon={<Save size={18} />}>
          Save Changes
        </Button>
      </div>

      <div className="space-y-8">
        {/* Contact Information */}
        <Card>
          <div className="flex items-center mb-6">
            <div className="bg-brand-100 p-2 rounded-lg mr-3 text-brand-600">
               <Phone size={20} />
            </div>
            <h3 className="font-bold text-slate-900">Contact Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Company Name" 
              value={formData.company_name || ''} 
              onChange={e => handleChange('company_name', e.target.value)}
              icon={<Globe size={16}/>}
            />
            <Input 
              label="Contact Email" 
              value={formData.contact_email || ''} 
              onChange={e => handleChange('contact_email', e.target.value)}
              icon={<Mail size={16}/>}
            />
            <Input 
              label="Phone Number" 
              value={formData.contact_phone || ''} 
              onChange={e => handleChange('contact_phone', e.target.value)}
              icon={<Phone size={16}/>}
            />
             <Input 
              label="WhatsApp Link" 
              value={formData.whatsapp_link || ''} 
              onChange={e => handleChange('whatsapp_link', e.target.value)}
              icon={<MessageSquare size={16}/>}
            />
            <div className="md:col-span-2">
              <Input 
                label="Physical Address" 
                value={formData.contact_address || ''} 
                onChange={e => handleChange('contact_address', e.target.value)}
                icon={<MapPin size={16}/>}
              />
            </div>
          </div>
        </Card>

        {/* Hero Section */}
        <Card>
          <div className="flex items-center mb-6">
             <div className="bg-brand-100 p-2 rounded-lg mr-3 text-brand-600">
               <Layout size={20} />
             </div>
             <h3 className="font-bold text-slate-900">Home Page Hero</h3>
          </div>
          <div className="space-y-6">
            <Input 
              label="Main Headline" 
              value={formData.hero_title || ''} 
              onChange={e => handleChange('hero_title', e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Subtitle</label>
              <textarea 
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                rows={3}
                value={formData.hero_subtitle || ''} 
                onChange={e => handleChange('hero_subtitle', e.target.value)}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminContent;
