
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { signIn, signOut, signUp, resetPassword, updatePassword, useAuth } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<any>;
  forgotPassword: (email: string) => Promise<any>;
  changePassword: (password: string) => Promise<any>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session, loading, isAdmin } = useAuth();
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Função para forçar a atualização do contexto
  const refreshUser = useCallback(() => {
    console.log("Refreshing user context");
    setRefreshCounter(prev => prev + 1);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await signIn(email, password);
    return response;
  };

  const logout = async () => {
    await signOut();
  };

  const register = async (email: string, password: string) => {
    const response = await signUp(email, password);
    return response;
  };

  const forgotPassword = async (email: string) => {
    const response = await resetPassword(email);
    return response;
  };

  const changePassword = async (password: string) => {
    const response = await updatePassword(password);
    return response;
  };

  const value = {
    user,
    session,
    loading,
    isAdmin,
    login,
    logout,
    register,
    forgotPassword,
    changePassword,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
