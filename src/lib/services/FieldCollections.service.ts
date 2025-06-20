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
  constructor(private readonly _supabase = supabase) {}

  async getAll(): Promise<FieldCollectionRow[]> {
    const { data, error } = await this._supabase
      .from('field_collections')
      .select('*');
    if (error) {
      console.error('Error fetching field collections:', error);
    }
    return data ?? [];
  }

  async getById(id: string): Promise<FieldCollectionRow | null> {
    const { data, error } = await this._supabase
      .from('field_collections')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      console.error('Error fetching field collection by id:', error);
    }
    return data ?? null;
  }

  async getBySiteId(siteId: string): Promise<FieldCollectionRow[]> {
    const { data, error } = await this._supabase
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
    let query = this._supabase
      .from('field_collections')
      .select('*')
      .eq('name', name);

    if (siteId) {
      query = query.eq('site_id', siteId);
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
    const { data, error } = await this._supabase
      .from('field_collections')
      .insert(fieldCollection)
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
    const { data, error } = await this._supabase
      .from('field_collections')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Error updating field collection:', error);
    }
    return data ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this._supabase
      .from('field_collections')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Error deleting field collection:', error);
    }
    return !error;
  }

  async getOrCreate(name: string, siteId: string): Promise<FieldCollectionRow> {
    // Try to find existing collection
    const existing = await this.getByName(name, siteId);
    if (existing) {
      return existing;
    }

    // Create new collection if it doesn't exist
    const newCollection = await this.create({
      name,
      site_id: siteId,
    });

    if (!newCollection) {
      throw new Error(`Failed to create field collection: ${name}`);
    }

    return newCollection;
  }
}

export const fieldCollectionsService = new FieldCollectionsService();
