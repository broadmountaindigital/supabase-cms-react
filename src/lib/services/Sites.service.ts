import { supabase } from '@/lib/utils/supabase';
import type { SiteRow } from '@/types/database';
import type { TablesInsert, TablesUpdate } from '@/types/database/supabase';

class SitesService {
  constructor(private readonly _supabase = supabase) {}

  async getAll(): Promise<SiteRow[]> {
    const { data, error } = await this._supabase.from('sites').select('*');
    if (error) {
      console.error('Error fetching sites:', error);
    }
    return data ?? [];
  }

  async getById(id: string): Promise<SiteRow | null> {
    const { data, error } = await this._supabase
      .from('sites')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      console.error('Error fetching site by id:', error);
    }
    return data ?? null;
  }

  async create(site: TablesInsert<'sites'>): Promise<SiteRow | null> {
    const { data, error } = await this._supabase
      .from('sites')
      .insert(site)
      .select()
      .single();
    if (error) {
      console.error('Error creating site:', error);
    }
    return data ?? null;
  }

  async update(
    id: string,
    updates: TablesUpdate<'sites'>
  ): Promise<SiteRow | null> {
    const { data, error } = await this._supabase
      .from('sites')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Error updating site:', error);
    }
    return data ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this._supabase.from('sites').delete().eq('id', id);
    if (error) {
      console.error('Error deleting site:', error);
    }
    return !error;
  }
}

export const sitesService = new SitesService();
