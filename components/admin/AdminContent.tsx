import React, { useState } from 'react';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';
import { supabase } from '../../lib/supabaseClient';
import Card from '../ui/Card';
import Button from '../Button';
import Input from '../ui/Input';
import { Save, Globe, Phone, Mail, MapPin, MessageSquare, Layout, Twitter, Linkedin, Instagram, Image as ImageIcon, Loader2, UploadCloud, Share2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const AdminContent: React.FC = () => {
  const { settings, updateSetting } = useSiteSettings();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingSocial, setIsUploadingSocial] = useState(false);

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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `logo-${Date.now()}.${fileExt}`;
    const filePath = `branding/${fileName}`;

    setIsUploading(true);

    try {
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('uploads').getPublicUrl(filePath);
      
      handleChange('logo_url', data.publicUrl);
      success('Logo uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      showError('Error uploading logo: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSocialImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `og-image-${Date.now()}.${fileExt}`;
    const filePath = `branding/${fileName}`;

    setIsUploadingSocial(true);

    try {
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('uploads').getPublicUrl(filePath);
      
      handleChange('og_image_url', data.publicUrl);
      success('Social image uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading social image:', error);
      showError('Error uploading image: ' + error.message);
    } finally {
      setIsUploadingSocial(false);
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
        {/* Branding Section */}
        <Card>
          <div className="flex items-center mb-6">
            <div className="bg-brand-100 p-2 rounded-lg mr-3 text-brand-600">
               <ImageIcon size={20} />
            </div>
            <h3 className="font-bold text-slate-900">Branding & Identity</h3>
          </div>
          <div className="grid grid-cols-1 gap-8">
             {/* Logo */}
             <div className="border-b border-slate-100 pb-8">
                <label className="block text-sm font-medium text-slate-700 mb-2">Company Logo</label>
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden">
                      {formData.logo_url ? (
                        <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-xs text-slate-400">No Logo</span>
                      )}
                   </div>
                   <div className="flex-1">
                      <div className="relative">
                        <input 
                          type="file" 
                          id="logo-upload" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleLogoUpload}
                          disabled={isUploading}
                        />
                        <label 
                          htmlFor="logo-upload"
                          className={`inline-flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg cursor-pointer bg-white hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isUploading ? <Loader2 size={16} className="animate-spin mr-2" /> : <UploadCloud size={16} className="mr-2" />}
                          {isUploading ? 'Uploading...' : 'Upload New Logo'}
                        </label>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Used in Navbar. Recommended: PNG or SVG, 200x200px</p>
                   </div>
                </div>
             </div>

             {/* Social Sharing Image */}
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                  Social Sharing Image (OG Tag)
                  <Share2 size={14} className="ml-2 text-slate-400" />
                </label>
                <div className="flex items-start gap-4">
                   <div className="w-48 h-24 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden relative group">
                      {formData.og_image_url ? (
                        <img src={formData.og_image_url} alt="Social Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-slate-400">No Image</span>
                      )}
                   </div>
                   <div className="flex-1">
                      <div className="relative">
                        <input 
                          type="file" 
                          id="og-upload" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleSocialImageUpload}
                          disabled={isUploadingSocial}
                        />
                        <label 
                          htmlFor="og-upload"
                          className={`inline-flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg cursor-pointer bg-white hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700 ${isUploadingSocial ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isUploadingSocial ? <Loader2 size={16} className="animate-spin mr-2" /> : <UploadCloud size={16} className="mr-2" />}
                          {isUploadingSocial ? 'Uploading...' : 'Upload Banner'}
                        </label>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Displayed when sharing link on WhatsApp/LinkedIn. Recommended: 1200x630px JPG/PNG.
                      </p>
                   </div>
                </div>
             </div>

             <div>
               <Input 
                 label="Company Name" 
                 value={formData.company_name || ''} 
                 onChange={e => handleChange('company_name', e.target.value)}
                 icon={<Globe size={16}/>}
               />
             </div>
          </div>
        </Card>

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

        {/* Social Media */}
        <Card>
          <div className="flex items-center mb-6">
            <div className="bg-brand-100 p-2 rounded-lg mr-3 text-brand-600">
               <Twitter size={20} />
            </div>
            <h3 className="font-bold text-slate-900">Social Media Links</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input 
              label="Twitter / X" 
              value={formData.social_twitter || ''} 
              onChange={e => handleChange('social_twitter', e.target.value)}
              icon={<Twitter size={16}/>}
              placeholder="https://twitter.com/..."
            />
            <Input 
              label="LinkedIn" 
              value={formData.social_linkedin || ''} 
              onChange={e => handleChange('social_linkedin', e.target.value)}
              icon={<Linkedin size={16}/>}
              placeholder="https://linkedin.com/in/..."
            />
            <Input 
              label="Instagram" 
              value={formData.social_instagram || ''} 
              onChange={e => handleChange('social_instagram', e.target.value)}
              icon={<Instagram size={16}/>}
              placeholder="https://instagram.com/..."
            />
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