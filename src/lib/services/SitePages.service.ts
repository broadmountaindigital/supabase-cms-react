import { supabase } from '@/lib/utils/supabase';
import type { SitePageRow } from '@/types/database';
import type { TablesInsert, TablesUpdate } from '@/types/database/supabase';

class SitePagesService {
  constructor(private readonly _supabase = supabase) {}

  async getAll(): Promise<SitePageRow[]> {
    const { data, error } = await this._supabase.from('site_pages').select('*');
    if (error) {
      console.error('Error fetching site pages:', error);
    }
    return data ?? [];
  }

  async getById(id: string): Promise<SitePageRow | null> {
    const { data, error } = await this._supabase
      .from('site_pages')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      console.error('Error fetching site page by id:', error);
    }
    return data ?? null;
  }

  async create(
    sitePage: TablesInsert<'site_pages'>
  ): Promise<SitePageRow | null> {
    const { data, error } = await this._supabase
      .from('site_pages')
      .insert(sitePage)
      .select()
      .single();
    if (error) {
      console.error('Error creating site page:', error);
    }
    return data ?? null;
  }

  async update(
    id: string,
    updates: TablesUpdate<'site_pages'>
  ): Promise<SitePageRow | null> {
    const { data, error } = await this._supabase
      .from('site_pages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Error updating site page:', error);
    }
    return data ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this._supabase
      .from('site_pages')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Error deleting site page:', error);
    }
    return !error;
  }
}

export const sitePagesService = new SitePagesService();
