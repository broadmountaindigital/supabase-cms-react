import { supabase } from '@/lib/utils/supabase';
import type { SiteRow } from '@/types/database';
import type { TablesInsert, TablesUpdate } from '@/types/database/supabase';

class SitesService {
  constructor(
    readonly db = supabase,
    readonly siteId?: string
  ) {}

  async getAll(): Promise<SiteRow[]> {
    let query = this.db.from('sites').select('*');

    if (this.siteId) {
      query = query.eq('id', this.siteId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching sites:', error);
    }
    return data ?? [];
  }

  async getById(id: string): Promise<SiteRow | null> {
    let query = this.db.from('sites').select('*').eq('id', id);

    if (this.siteId) {
      query = query.eq('id', this.siteId);
    }

    const { data, error } = await query.single();
    if (error) {
      console.error('Error fetching site by id:', error);
    }
    return data ?? null;
  }

  async create(site: TablesInsert<'sites'>): Promise<SiteRow | null> {
    const { data, error } = await this.db
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
    let query = this.db.from('sites').update(updates).eq('id', id);

    if (this.siteId) {
      query = query.eq('id', this.siteId);
    }

    const { data, error } = await query.select().single();
    if (error) {
      console.error('Error updating site:', error);
    }
    return data ?? null;
  }

  async delete(id: string): Promise<boolean> {
    let query = this.db.from('sites').delete().eq('id', id);

    if (this.siteId) {
      query = query.eq('id', this.siteId);
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
    return new SitesService(this.db, siteId);
  }
}

export const sitesService = new SitesService();
