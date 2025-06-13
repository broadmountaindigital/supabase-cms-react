import { supabase } from '@/lib/utils/supabase';
import type { ContentFieldRow } from '@/types/database';
import type { TablesInsert, TablesUpdate } from '@/types/database/supabase';

class ContentFieldsService {
  constructor(private readonly _supabase = supabase) {}

  async getAll(): Promise<ContentFieldRow[]> {
    const { data, error } = await this._supabase
      .from('content_fields')
      .select('*');
    if (error) {
      console.error('Error fetching content fields:', error);
    }
    return data ?? [];
  }

  async getById(id: string): Promise<ContentFieldRow | null> {
    const { data, error } = await this._supabase
      .from('content_fields')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      console.error('Error fetching content field by id:', error);
    }
    return data ?? null;
  }

  async create(
    contentField: TablesInsert<'content_fields'>
  ): Promise<ContentFieldRow | null> {
    const { data, error } = await this._supabase
      .from('content_fields')
      .insert(contentField)
      .select()
      .single();
    if (error) {
      console.error('Error creating content field:', error);
    }
    return data ?? null;
  }

  async update(
    id: string,
    updates: TablesUpdate<'content_fields'>
  ): Promise<ContentFieldRow | null> {
    const { data, error } = await this._supabase
      .from('content_fields')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Error updating content field:', error);
    }
    return data ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this._supabase
      .from('content_fields')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Error deleting content field:', error);
    }
    return !error;
  }
}

export const contentFieldsService = new ContentFieldsService();
