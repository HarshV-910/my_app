import { supabase } from '../lib/supabase';
import { User, UserStatus } from '../types';

export const userService = {
  // Get all users (for host)
  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name');

    if (error) throw error;

    // Get emails from auth.users (requires service_role in production, 
    // for now we'll just return profiles without emails)
    return data.map(profile => ({
      id: profile.id,
      name: profile.name,
      role: profile.role as any,
      status: profile.status as any,
    }));
  },

  // Get pending users
  async getPendingUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('status', UserStatus.PENDING)
      .order('name');

    if (error) throw error;
    
    return data.map(profile => ({
      id: profile.id,
      name: profile.name,
      role: profile.role as any,
      status: profile.status as any,
    }));
  },

  // Approve member
  async approveMember(userId: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ status: UserStatus.APPROVED })
      .eq('id', userId);

    if (error) throw error;
  },

  // Update user profile
  async updateProfile(userId: string, updates: { name?: string }) {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;
  },
};
