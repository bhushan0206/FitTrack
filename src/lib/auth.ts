import { useEffect } from 'react';
import { useClerk, useUser } from '@clerk/clerk-react';
import { supabase } from './supabase';
import { supabaseAdmin } from './supabaseAdmin';

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const syncUserToSupabase = async (clerkUser: any) => {
  if (!clerkUser) return null;
  
  try {
    // Use the admin client that bypasses RLS
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: clerkUser.id,
        name: clerkUser.firstName || clerkUser.username || 'User',
        email: clerkUser.primaryEmailAddress?.emailAddress,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error details:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error syncing user to Supabase:', error);
    throw error;
  }
};

export const useAuthSync = () => {
  const { user: clerkUser } = useUser();
  
  useEffect(() => {
    if (clerkUser) {
      syncUserToSupabase(clerkUser).catch(console.error);
    }
  }, [clerkUser]);

  return clerkUser;
};
