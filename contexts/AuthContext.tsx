
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { AdminUser } from '../types';

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const formatUser = (supabaseUser: any): AdminUser | null => {
    if (!supabaseUser) return null;
    
    // Prioritize metadata for role/approval status
    const meta = supabaseUser.user_metadata || {};
    const role = meta.role || 'employee';
    const is_approved = meta.is_approved === true;

    return {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      role: role as 'admin' | 'employee',
      is_approved: is_approved
    };
  };

  const refreshUser = async () => {
    try {
      const { data: { user: sbUser }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      // Double check the team_members table for the approval status
      // because triggers update metadata with a slight delay
      const { data: memberData } = await supabase
        .from('team_members')
        .select('is_approved, role')
        .eq('id', sbUser?.id)
        .maybeSingle();

      const baseUser = formatUser(sbUser);
      if (baseUser && memberData) {
        baseUser.is_approved = memberData.is_approved;
        baseUser.role = memberData.role as 'admin' | 'employee';
      }
      
      setUser(baseUser);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(formatUser(session.user));
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await refreshUser(); 
  };

  const register = async (email: string, password: string, name: string) => {
    // We only create the Auth record now.
    // The Database Trigger (handle_new_user) will automatically create 
    // the row in the public.team_members table.
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: 'employee',
          is_approved: false 
        }
      }
    });
    
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
