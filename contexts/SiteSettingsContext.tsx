import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { SiteSetting } from '../types';
import { COMPANY_NAME, WHATSAPP_LINK } from '../constants';

interface SiteSettingsContextType {
  settings: Record<string, string>;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateSetting: (key: string, value: string) => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

// Default fallback values if DB is empty or loading
const DEFAULTS: Record<string, string> = {
  company_name: COMPANY_NAME,
  contact_email: 'hello@hyperbuildlabs.com',
  contact_phone: '+1 (555) 123-4567',
  contact_address: '123 Innovation Dr, Tech City',
  hero_title: 'AI-Powered Websites & Automation Systems',
  hero_subtitle: 'We build enterprise-grade digital experiences, e-commerce platforms, and custom AI agents that grow your business on autopilot.',
  whatsapp_link: WHATSAPP_LINK,
};

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('site_settings').select('*');
      if (error) {
        console.warn("Could not fetch settings (using defaults):", error.message);
        return;
      }
      
      if (data && data.length > 0) {
        const newSettings = { ...DEFAULTS };
        data.forEach((item: SiteSetting) => {
          newSettings[item.key] = item.value;
        });
        setSettings(newSettings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    // Optimistic update
    setSettings(prev => ({ ...prev, [key]: value }));
    
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key, value });
      
    if (error) throw error;
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings, updateSetting }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
};
