import { supabase } from '@/lib/utils/supabase';
import type { ProfileRow } from '@/types/database';
import type { TablesInsert, TablesUpdate } from '@/types/database/supabase';

class ProfilesService {
  constructor(private readonly _supabase = supabase) {}

  async getAll(): Promise<ProfileRow[]> {
    const { data, error } = await this._supabase.from('profiles').select('*');
    if (error) {
      console.error('Error fetching profiles:', error);
    }
    return data ?? [];
  }

  async getById(id: string): Promise<ProfileRow | null> {
    const { data, error } = await this._supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      console.error('Error fetching profile by id:', error);
    }
    return data ?? null;
  }

  async create(profile: TablesInsert<'profiles'>): Promise<ProfileRow | null> {
    const { data, error } = await this._supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single();
    if (error) {
      console.error('Error creating profile:', error);
    }
    return data ?? null;
  }

  async update(
    id: string,
    updates: TablesUpdate<'profiles'>
  ): Promise<ProfileRow | null> {
    const { data, error } = await this._supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Error updating profile:', error);
    }
    return data ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this._supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Error deleting profile:', error);
    }
    return !error;
  }
}

export const profilesService = new ProfilesService();
