
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) {
    throw error;
  }
  
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    throw error;
  }
  
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw error;
  }
}

export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  
  if (error) {
    throw error;
  }
  
  return data;
}

export async function updatePassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({
    password,
  });
  
  if (error) {
    throw error;
  }
  
  return data;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const setupAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
      
      if (data.session?.user) {
        // Check if the user is an admin by checking the 'role' column
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.session.user.id)
          .single();

        // Only set isAdmin to true if profileData exists and role is 'admin'
        if (profileData) {
          setIsAdmin(profileData.role === 'admin');
        }
      }
      
      setLoading(false);

      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            // Check if the user is an admin by checking the 'role' column
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();

            // Only set isAdmin to true if profileData exists and role is 'admin'
            if (profileData) {
              setIsAdmin(profileData.role === 'admin');
            } else {
              setIsAdmin(false);
            }
          } else {
            setIsAdmin(false);
          }
          
          setLoading(false);
        }
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    };

    setupAuth();
  }, []);

  return { user, session, loading, isAdmin };
}
