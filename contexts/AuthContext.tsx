
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
      const { data: { user: sbUser }, error: userError } = await supabase.auth.getUser();
      if (userError || !sbUser) {
        setUser(null);
        return;
      }
      
      try {
        const { data: memberData } = await supabase
          .from('team_members')
          .select('is_approved, role')
          .eq('id', sbUser.id)
          .maybeSingle();

        const baseUser = formatUser(sbUser);
        if (baseUser && memberData) {
          baseUser.is_approved = memberData.is_approved;
          baseUser.role = memberData.role as 'admin' | 'employee';
        }
        setUser(baseUser);
      } catch (dbErr) {
        console.warn("DB check failed during refresh, using metadata fallback:", dbErr);
        setUser(formatUser(sbUser));
      }
      
    } catch (err) {
      console.error("Auth Refresh failed (likely network):", err);
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
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await refreshUser(); 
    } catch (err: any) {
      // Normalize 'Failed to fetch' error
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        throw new Error("NETWORK_UNREACHABLE");
      }
      throw err;
    }
  };

  const register = async (email: string, password: string, name: string) => {
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
