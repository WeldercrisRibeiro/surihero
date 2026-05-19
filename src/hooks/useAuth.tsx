import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, type Profile } from '@/lib/supabase';
import { toast } from 'sonner';

interface AuthContextType {
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  // For local test/development:
  mockLogin: (role: 'user' | 'admin') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for mock profile in localStorage for development
    const savedMock = localStorage.getItem('suri-mock-profile');
    if (savedMock) {
      setProfile(JSON.parse(savedMock));
      setLoading(false);
      return;
    }

    // Trava de segurança global: se o Auth não responder em 6s, libera o app
    const authTimeout = setTimeout(() => {
      if (loading) {
        console.warn('Auth check timed out after 6s, forcing loading to false');
        setLoading(false);
      }
    }, 6000);

    const checkUser = async () => {
      console.log('Checking user auth status...');
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) {
          console.error('Auth getUser error:', authError);
        }

        if (user) {
          console.log('User found:', user.email, 'Fetching profile...');
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (data) {
            console.log('Profile fetched successfully');
            setProfile(data);
          } else if (error) {
            console.error('Error fetching profile:', error);
          }
        } else {
          console.log('No active session found');
        }
      } catch (error) {
        console.error('Auth unexpected error:', error);
      } finally {
        clearTimeout(authTimeout);
        setLoading(false);
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(data);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    localStorage.removeItem('suri-mock-profile');
    await supabase.auth.signOut();
    setProfile(null);
    toast.success('Sessão encerrada');
  };

  const mockLogin = (role: 'user' | 'admin') => {
    const mockUser: Profile = {
      id: role === 'admin' ? '00000000-0000-0000-0000-000000000001' : '00000000-0000-0000-0000-000000000002',
      name: role === 'admin' ? 'Admin Suri' : 'Usuário Suri',
      phone: role === 'admin' ? '11999999999' : '11888888888',
      role: role,
      created_at: new Date().toISOString(),
    };
    localStorage.setItem('suri-mock-profile', JSON.stringify(mockUser));
    setProfile(mockUser);
    toast.success(`Logado como ${role.toUpperCase()} (MOCK)`);
  };

  const value = {
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    signOut,
    mockLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
