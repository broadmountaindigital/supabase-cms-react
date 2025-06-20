import { supabase } from '@/lib/utils/supabase';
import type { SiteRow } from '@/types/database';
import type { TablesInsert, TablesUpdate } from '@/types/database/supabase';

class SitesService {
  constructor(
    private readonly _supabase = supabase,
    private readonly _siteId?: string
  ) {}

  async getAll(): Promise<SiteRow[]> {
    let query = this._supabase.from('sites').select('*');

    if (this._siteId) {
      query = query.eq('id', this._siteId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching sites:', error);
    }
    return data ?? [];
  }

  async getById(id: string): Promise<SiteRow | null> {
    let query = this._supabase.from('sites').select('*').eq('id', id);

    if (this._siteId) {
      query = query.eq('id', this._siteId);
    }

    const { data, error } = await query.single();
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
    let query = this._supabase.from('sites').update(updates).eq('id', id);

    if (this._siteId) {
      query = query.eq('id', this._siteId);
    }

    const { data, error } = await query.select().single();
    if (error) {
      console.error('Error updating site:', error);
    }
    return data ?? null;
  }

  async delete(id: string): Promise<boolean> {
    let query = this._supabase.from('sites').delete().eq('id', id);

    if (this._siteId) {
      query = query.eq('id', this._siteId);
    }

    const { error } = await query;
    if (error) {
      console.error('Error deleting site:', error);
    }
    return !error;
  }

  /**
   * Create a site-aware instance of this service
   */
  withSite(siteId: string): SitesService {
    return new SitesService(this._supabase, siteId);
  }
}

export const sitesService = new SitesService();
