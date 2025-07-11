import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser, AuthState } from '../types/auth';
import { auth } from '../lib/supabase';

interface AuthContextType extends AuthState {
  login: (email: string) => Promise<void>;
  register: (email: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyMagicLink: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Check for existing session
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await auth.getCurrentUser();
      setState(prev => ({ ...prev, user, loading: false }));
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const login = async (email: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await auth.signIn(email);
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
      // In a real implementation, this would create a new user
      await auth.signIn(email);
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
      await auth.signOut();
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
      // Mock verification - in real app this would verify the token
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