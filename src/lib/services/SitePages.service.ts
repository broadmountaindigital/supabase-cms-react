import { supabase } from '@/lib/utils/supabase';
import type { SitePageRow } from '@/types/database';
import type { TablesInsert, TablesUpdate } from '@/types/database/supabase';

class SitePagesService {
  constructor(
    readonly db = supabase,
    readonly siteId?: string
  ) {}

  async getAll(): Promise<SitePageRow[]> {
    let query = this.db.from('site_pages').select('*');

    if (this.siteId) {
      query = query.eq('site_id', this.siteId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching site pages:', error);
    }
    return data ?? [];
  }

  async getById(id: string): Promise<SitePageRow | null> {
    let query = this.db.from('site_pages').select('*').eq('id', id);

    if (this.siteId) {
      query = query.eq('site_id', this.siteId);
    }

    const { data, error } = await query.single();
    if (error) {
      console.error('Error fetching site page by id:', error);
    }
    return data ?? null;
  }

  async create(
    sitePage: TablesInsert<'site_pages'>
  ): Promise<SitePageRow | null> {
    const finalSitePage = this.siteId
      ? { ...sitePage, site_id: this.siteId }
      : sitePage;

    const { data, error } = await this.db
      .from('site_pages')
      .insert(finalSitePage)
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
    let query = this.db.from('site_pages').update(updates).eq('id', id);

    if (this.siteId) {
      query = query.eq('site_id', this.siteId);
    }

    const { data, error } = await query.select().single();
    if (error) {
      console.error('Error updating site page:', error);
    }
    return data ?? null;
  }

  async delete(id: string): Promise<boolean> {
    let query = this.db.from('site_pages').delete().eq('id', id);

    if (this.siteId) {
      query = query.eq('site_id', this.siteId);
    }

    const { error } = await query;
    if (error) {
      console.error('Error deleting site page:', error);
    }
    return !error;
  }

  /**
   * Create a site-aware instance of this service
   */
  withSite(siteId: string): SitePagesService {
    return new SitePagesService(this.db, siteId);
  }
}

export const sitePagesService = new SitePagesService();
