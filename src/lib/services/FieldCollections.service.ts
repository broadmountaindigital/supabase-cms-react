import { supabase } from '@/lib/utils/supabase';
import type { TablesInsert, TablesUpdate } from '@/types/database/supabase';

export interface FieldCollectionRow {
  id: string;
  site_id: string | null;
  name: string;
  created_at: string;
  updated_at: string;
}

class FieldCollectionsService {
  constructor(
    readonly db = supabase,
    readonly siteId?: string
  ) {}

  async getAll(): Promise<FieldCollectionRow[]> {
    let query = this.db.from('field_collections').select('*');

    if (this.siteId) {
      query = query.eq('site_id', this.siteId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching field collections:', error);
    }
    return data ?? [];
  }

  async getById(id: string): Promise<FieldCollectionRow | null> {
    let query = this.db.from('field_collections').select('*').eq('id', id);

    if (this.siteId) {
      query = query.eq('site_id', this.siteId);
    }

    const { data, error } = await query.single();
    if (error) {
      console.error('Error fetching field collection by id:', error);
    }
    return data ?? null;
  }

  async getBySiteId(siteId: string): Promise<FieldCollectionRow[]> {
    const { data, error } = await this.db
      .from('field_collections')
      .select('*')
      .eq('site_id', siteId);
    if (error) {
      console.error('Error fetching field collections by site id:', error);
    }
    return data ?? [];
  }

  async getByName(
    name: string,
    siteId?: string
  ): Promise<FieldCollectionRow | null> {
    let query = this.db.from('field_collections').select('*').eq('name', name);

    // Use provided siteId, then this.siteId, then no filtering
    const targetSiteId = siteId || this.siteId;
    if (targetSiteId) {
      query = query.eq('site_id', targetSiteId);
    }

    const { data, error } = await query.single();
    if (error) {
      console.error('Error fetching field collection by name:', error);
    }
    return data ?? null;
  }

  async create(
    fieldCollection: TablesInsert<'field_collections'>
  ): Promise<FieldCollectionRow | null> {
    const finalFieldCollection = this.siteId
      ? { ...fieldCollection, site_id: this.siteId }
      : fieldCollection;

    const { data, error } = await this.db
      .from('field_collections')
      .insert(finalFieldCollection)
      .select()
      .single();
    if (error) {
      console.error('Error creating field collection:', error);
    }
    return data ?? null;
  }

  async update(
    id: string,
    updates: TablesUpdate<'field_collections'>
  ): Promise<FieldCollectionRow | null> {
    let query = this.db.from('field_collections').update(updates).eq('id', id);

    if (this.siteId) {
      query = query.eq('site_id', this.siteId);
    }

    const { data, error } = await query.select().single();
    if (error) {
      console.error('Error updating field collection:', error);
    }
    return data ?? null;
  }

  async delete(id: string): Promise<boolean> {
    let query = this.db.from('field_collections').delete().eq('id', id);

    if (this.siteId) {
      query = query.eq('site_id', this.siteId);
    }

    const { error } = await query;
    if (error) {
      console.error('Error deleting field collection:', error);
    }
    return !error;
  }

  async getOrCreate(
    name: string,
    siteId?: string
  ): Promise<FieldCollectionRow> {
    const targetSiteId = siteId || this.siteId;
    if (!targetSiteId) {
      throw new Error('Site ID is required for getOrCreate operation');
    }

    // Try to find existing collection
    const existing = await this.getByName(name, targetSiteId);
    if (existing) {
      return existing;
    }

    // Create new collection if it doesn't exist
    const newCollection = await this.create({
      name,
      site_id: targetSiteId,
    });

    if (!newCollection) {
      throw new Error(`Failed to create field collection: ${name}`);
    }

    return newCollection;
  }

  /**
   * Create a site-aware instance of this service
   */
  withSite(siteId: string): FieldCollectionsService {
    return new FieldCollectionsService(this.db, siteId);
  }
}

export const fieldCollectionsService = new FieldCollectionsService();
