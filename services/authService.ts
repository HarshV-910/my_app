import { supabase } from '../lib/supabase';
import { User, Role, UserStatus } from '../types';

export const authService = {
  // Sign up new user
  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    
    if (error) throw error;
    return data;
  },

  // Sign in
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    // Try to revoke session if it exists; otherwise clear local state only to avoid
    // "Auth session missing" errors when there is no active session in memory.
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } else {
      // No active session token; clear local auth state without network call
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) throw error;
    }
  },

  // Get current session
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // Get current user profile
  async getCurrentUserProfile(): Promise<User | null> {
    const session = await this.getSession();
    if (!session) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) throw error;
    
    return data ? {
      id: data.id,
      name: data.name,
      email: session.user.email,
      role: data.role as Role,
      status: data.status as UserStatus,
    } : null;
  },

  // Listen to auth changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await this.getCurrentUserProfile();
        callback(profile);
      } else {
        callback(null);
      }
    });
  },
};
