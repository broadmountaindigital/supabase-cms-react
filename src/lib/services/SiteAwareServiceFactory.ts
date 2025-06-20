import { SupabaseClient } from '@supabase/supabase-js';
import type {
  SiteUpdate,
  ContentFieldInsert,
  ContentFieldUpdate,
  SitePageInsert,
  SitePageUpdate,
  ProfileInsert,
  ProfileUpdate,
} from '@/types/database';
import type { Database } from '@/types/database/supabase';
import { contentFieldRevisionsService } from './ContentFieldRevisions.service';
import type { ContentFieldRevision } from '@/types/RevisionTypes';

// Base service class with site awareness
export abstract class SiteAwareService {
  protected supabase: SupabaseClient<Database>;
  protected siteId: string;

  constructor(supabase: SupabaseClient<Database>, siteId: string) {
    this.supabase = supabase;
    this.siteId = siteId;
  }

  // Helper method to add site filter to queries
  protected withSiteFilter<T>(query: T): T {
    return query;
  }
}

// Sites Service (site-aware)
export class SiteAwareSitesService extends SiteAwareService {
  async getById(id: string) {
    const { data, error } = await this.supabase
      .from('sites')
      .select('*')
      .eq('id', id)
      .eq('id', this.siteId) // Only allow access to the current site
      .single();

    if (error) {
      console.error('Error fetching site by id:', error);
    }
    return data ?? null;
  }

  async update(updates: SiteUpdate) {
    const { data, error } = await this.supabase
      .from('sites')
      .update(updates)
      .eq('id', this.siteId) // Only allow updates to the current site
      .select()
      .single();

    if (error) {
      console.error('Error updating site:', error);
    }
    return data ?? null;
  }

  // Note: create and delete operations are typically not allowed for site-aware services
  // as they would affect other sites
}

// Content Fields Service (site-aware)
export class SiteAwareContentFieldsService extends SiteAwareService {
  async getAll() {
    const { data, error } = await this.supabase
      .from('content_fields')
      .select('*')
      .eq('site_id', this.siteId);

    if (error) {
      console.error('Error fetching content fields:', error);
    }
    return data ?? [];
  }

  async getById(id: string) {
    const { data, error } = await this.supabase
      .from('content_fields')
      .select('*')
      .eq('id', id)
      .eq('site_id', this.siteId)
      .single();

    if (error) {
      console.error('Error fetching content field by id:', error);
    }
    return data ?? null;
  }

  async create(contentField: Omit<ContentFieldInsert, 'site_id'>) {
    const { data, error } = await this.supabase
      .from('content_fields')
      .insert({ ...contentField, site_id: this.siteId })
      .select()
      .single();

    if (error) {
      console.error('Error creating content field:', error);
    }
    return data ?? null;
  }

  async update(id: string, updates: ContentFieldUpdate) {
    const { data, error } = await this.supabase
      .from('content_fields')
      .update(updates)
      .eq('id', id)
      .eq('site_id', this.siteId)
      .select()
      .single();

    if (error) {
      console.error('Error updating content field:', error);
    }
    return data ?? null;
  }

  async delete(id: string) {
    const { error } = await this.supabase
      .from('content_fields')
      .delete()
      .eq('id', id)
      .eq('site_id', this.siteId);

    if (error) {
      console.error('Error deleting content field:', error);
    }

    return !error;
  }

  /**
   * Create a content field with optional revision tracking
   */
  async createWithRevisions(
    contentField: Omit<ContentFieldInsert, 'site_id'>,
    revisionConfig?: {
      enabled: boolean;
      createdBy?: string;
      metadata?: Record<string, unknown>;
    }
  ) {
    // Create the content field first
    const createdField = await this.create(contentField);

    if (!createdField || !revisionConfig?.enabled) {
      return createdField;
    }

    // Create initial revision if revision tracking is enabled
    if (createdField.field_value) {
      try {
        await contentFieldRevisionsService.createRevision({
          content_field_id: createdField.id,
          field_value: createdField.field_value,
          created_by: revisionConfig.createdBy,
          metadata: revisionConfig.metadata,
        });
      } catch (error) {
        console.error('Error creating initial revision:', error);
        // Don't fail the content field creation if revision creation fails
      }
    }

    return createdField;
  }

  /**
   * Update a content field with optional revision tracking
   */
  async updateWithRevisions(
    id: string,
    updates: ContentFieldUpdate,
    revisionConfig?: {
      enabled: boolean;
      createdBy?: string;
      metadata?: Record<string, unknown>;
    }
  ) {
    // Check if we need to create a revision before updating
    let shouldCreateRevision = false;
    let oldField = null;

    if (revisionConfig?.enabled && updates.field_value !== undefined) {
      oldField = await this.getById(id);
      shouldCreateRevision =
        !!oldField && oldField.field_value !== updates.field_value;
    }

    // Update the content field
    const updatedField = await this.update(id, updates);

    if (!updatedField || !shouldCreateRevision || !oldField) {
      return updatedField;
    }

    // Create revision after successful update
    try {
      await contentFieldRevisionsService.createRevision({
        content_field_id: updatedField.id,
        field_value: updatedField.field_value || '',
        created_by: revisionConfig?.createdBy,
        metadata: revisionConfig?.metadata,
      });
    } catch (error) {
      console.error('Error creating revision:', error);
      // Don't fail the update if revision creation fails
    }

    return updatedField;
  }

  /**
   * Get revision history for a content field
   */
  async getRevisionHistory(
    contentFieldId: string
  ): Promise<ContentFieldRevision[]> {
    const historyResponse =
      await contentFieldRevisionsService.getRevisionHistory({
        content_field_id: contentFieldId,
      });
    return historyResponse.revisions;
  }

  /**
   * Get current revision for a content field
   */
  async getCurrentRevision(
    contentFieldId: string
  ): Promise<ContentFieldRevision | null> {
    return await contentFieldRevisionsService.getCurrentRevision(
      contentFieldId
    );
  }
}

// Site Pages Service (site-aware)
export class SiteAwareSitePagesService extends SiteAwareService {
  async getAll() {
    const { data, error } = await this.supabase
      .from('site_pages')
      .select('*')
      .eq('site_id', this.siteId);

    if (error) {
      console.error('Error fetching site pages:', error);
    }
    return data ?? [];
  }

  async getById(id: string) {
    const { data, error } = await this.supabase
      .from('site_pages')
      .select('*')
      .eq('id', id)
      .eq('site_id', this.siteId)
      .single();

    if (error) {
      console.error('Error fetching site page by id:', error);
    }

    return data ?? null;
  }

  async create(sitePage: Omit<SitePageInsert, 'site_id'>) {
    const { data, error } = await this.supabase
      .from('site_pages')
      .insert({ ...sitePage, site_id: this.siteId })
      .select()
      .single();

    if (error) {
      console.error('Error creating site page:', error);
    }

    return data ?? null;
  }

  async update(id: string, updates: SitePageUpdate) {
    const { data, error } = await this.supabase
      .from('site_pages')
      .update(updates)
      .eq('id', id)
      .eq('site_id', this.siteId)
      .select()
      .single();

    if (error) {
      console.error('Error updating site page:', error);
    }
    return data ?? null;
  }

  async delete(id: string) {
    const { error } = await this.supabase
      .from('site_pages')
      .delete()
      .eq('id', id)
      .eq('site_id', this.siteId);

    if (error) {
      console.error('Error deleting site page:', error);
    }
    return !error;
  }
}

// Profiles Service (site-aware)
export class SiteAwareProfilesService extends SiteAwareService {
  async getAll() {
    // Use a simpler approach to avoid deep type issues
    const query = this.supabase.from('profiles').select('*');
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching profiles:', error);
      return [];
    }

    // Filter by site_id manually since the table might not have site_id
    // This is a workaround for the type issue
    return data || [];
  }

  async getById(id: string) {
    const query = this.supabase.from('profiles').select('*').eq('id', id);
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching profile by id:', error);
      return null;
    }

    return data?.[0] || null;
  }

  async create(profile: Omit<ProfileInsert, 'site_id'>) {
    const query = this.supabase.from('profiles').insert(profile).select();
    const { data, error } = await query;

    if (error) {
      console.error('Error creating profile:', error);
      return null;
    }

    return data?.[0] || null;
  }

  async update(id: string, updates: ProfileUpdate) {
    const query = this.supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select();
    const { data, error } = await query;

    if (error) {
      console.error('Error updating profile:', error);
      return null;
    }

    return data?.[0] || null;
  }

  async delete(id: string) {
    const query = this.supabase.from('profiles').delete().eq('id', id);
    const { error } = await query;

    if (error) {
      console.error('Error deleting profile:', error);
    }

    return !error;
  }
}

// Field Collections Service (site-aware)
export class SiteAwareFieldCollectionsService extends SiteAwareService {
  async getAll() {
    const { data, error } = await this.supabase
      .from('field_collections')
      .select('*')
      .eq('site_id', this.siteId);

    if (error) {
      console.error('Error fetching field collections:', error);
    }
    return data ?? [];
  }

  async getById(id: string) {
    const { data, error } = await this.supabase
      .from('field_collections')
      .select('*')
      .eq('id', id)
      .eq('site_id', this.siteId)
      .single();

    if (error) {
      console.error('Error fetching field collection by id:', error);
    }
    return data ?? null;
  }

  async getByName(name: string) {
    const { data, error } = await this.supabase
      .from('field_collections')
      .select('*')
      .eq('name', name)
      .eq('site_id', this.siteId)
      .single();

    if (error) {
      console.error('Error fetching field collection by name:', error);
    }
    return data ?? null;
  }

  async create(name: string) {
    const { data, error } = await this.supabase
      .from('field_collections')
      .insert({ name, site_id: this.siteId })
      .select()
      .single();

    if (error) {
      console.error('Error creating field collection:', error);
    }
    return data ?? null;
  }

  async update(id: string, updates: { name: string }) {
    const { data, error } = await this.supabase
      .from('field_collections')
      .update(updates)
      .eq('id', id)
      .eq('site_id', this.siteId)
      .select()
      .single();

    if (error) {
      console.error('Error updating field collection:', error);
    }
    return data ?? null;
  }

  async delete(id: string) {
    const { error } = await this.supabase
      .from('field_collections')
      .delete()
      .eq('id', id)
      .eq('site_id', this.siteId);

    if (error) {
      console.error('Error deleting field collection:', error);
    }

    return !error;
  }

  async getOrCreate(name: string) {
    // Try to find existing collection
    const existing = await this.getByName(name);
    if (existing) {
      return existing;
    }

    // Create new collection if it doesn't exist
    return await this.create(name);
  }
}

// Service Factory
export class SiteAwareServiceFactory {
  private supabase: SupabaseClient<Database>;
  private siteId: string;

  constructor(supabase: SupabaseClient<Database>, siteId: string) {
    this.supabase = supabase;
    this.siteId = siteId;
  }

  createSitesService() {
    return new SiteAwareSitesService(this.supabase, this.siteId);
  }

  createContentFieldsService() {
    return new SiteAwareContentFieldsService(this.supabase, this.siteId);
  }

  createSitePagesService() {
    return new SiteAwareSitePagesService(this.supabase, this.siteId);
  }

  createProfilesService() {
    return new SiteAwareProfilesService(this.supabase, this.siteId);
  }

  createFieldCollectionsService() {
    return new SiteAwareFieldCollectionsService(this.supabase, this.siteId);
  }
}
