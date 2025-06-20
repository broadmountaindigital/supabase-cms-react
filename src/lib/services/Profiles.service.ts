import { supabase } from '@/lib/utils/supabase';
import type { ProfileRow } from '@/types/database';
import type { TablesInsert, TablesUpdate } from '@/types/database/supabase';

class ProfilesService {
  constructor(readonly db = supabase) {}

  async getAll(): Promise<ProfileRow[]> {
    // Profiles don't have site_id, so we just return all profiles
    // The siteId parameter is kept for consistency but not used
    const { data, error } = await this.db.from('profiles').select('*');
    if (error) {
      console.error('Error fetching profiles:', error);
    }
    return data ?? [];
  }

  async getById(id: string): Promise<ProfileRow | null> {
    const { data, error } = await this.db
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
    const { data, error } = await this.db
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
    const { data, error } = await this.db
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
    const { error } = await this.db.from('profiles').delete().eq('id', id);
    if (error) {
      console.error('Error deleting profile:', error);
    }
    return !error;
  }
}

export const profilesService = new ProfilesService();
