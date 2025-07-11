import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser, AuthState } from '../types/auth';
import { auth, supabase } from '../lib/supabase';

interface AuthContextType extends AuthState {
  login: (email: string) => Promise<void>;
  register: (email: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyMagicLink: (token: string) => Promise<void>;
  loginAsAdmin: () => void;
  loginAsUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Check for existing session only if Supabase is configured
    if (supabase) {
      checkAuth();
    } else {
      // For development without database, check localStorage
      const savedUser = localStorage.getItem('temp_user');
      if (savedUser) {
        setState(prev => ({ ...prev, user: JSON.parse(savedUser), loading: false }));
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    }
  }, []);

  const checkAuth = async () => {
    try {
      const user = await auth.getCurrentUser();
      setState(prev => ({ ...prev, user, loading: false }));
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const loginAsAdmin = () => {
    const adminUser: AuthUser = {
      id: 'temp-admin-001',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN',
      isActive: true,
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem('temp_user', JSON.stringify(adminUser));
    setState({ user: adminUser, loading: false, error: null });
  };

  const loginAsUser = () => {
    const regularUser: AuthUser = {
      id: 'temp-user-001',
      email: 'user@example.com',
      name: 'John Doe',
      role: 'USER',
      isActive: true,
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem('temp_user', JSON.stringify(regularUser));
    setState({ user: regularUser, loading: false, error: null });
  };

  const login = async (email: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      if (supabase) {
        await auth.signIn(email);
      } else {
        // Temporary login without database
        const isAdmin = email.includes('admin');
        if (isAdmin) {
          loginAsAdmin();
        } else {
          loginAsUser();
        }
      }
      setState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      }));
    }
  };

  const register = async (email: string, name: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      if (supabase) {
        await auth.signIn(email);
      } else {
        // Temporary registration without database
        const newUser: AuthUser = {
          id: `temp-${Date.now()}`,
          email,
          name,
          role: 'USER',
          isActive: true,
          isVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem('temp_user', JSON.stringify(newUser));
        setState({ user: newUser, loading: false, error: null });
      }
      setState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      }));
    }
  };

  const logout = async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      if (supabase) {
        await auth.signOut();
      } else {
        localStorage.removeItem('temp_user');
      }
      setState({ user: null, loading: false, error: null });
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Logout failed' 
      }));
    }
  };

  const verifyMagicLink = async (token: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      if (supabase) {
        // Real verification would happen here
        const mockUser: AuthUser = {
          id: '1',
          email: 'user@example.com',
          name: 'John Doe',
          role: 'USER',
          isActive: true,
          isVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setState({ user: mockUser, loading: false, error: null });
      } else {
        // Temporary verification
        loginAsUser();
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Verification failed' 
      }));
    }
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      verifyMagicLink,
      loginAsAdmin,
      loginAsUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}