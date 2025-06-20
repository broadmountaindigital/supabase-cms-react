import { supabase } from '@/lib/utils/supabase';
import type { ContentFieldRow } from '@/types/database';
import type { TablesInsert, TablesUpdate } from '@/types/database/supabase';
import { contentFieldRevisionsService } from './ContentFieldRevisions.service';
import { fieldCollectionsService } from './FieldCollections.service';
import type { ContentFieldRevision } from '@/types/RevisionTypes';

class ContentFieldsService {
  constructor(private readonly _supabase = supabase) {}

  /**
   * Create a content field with optional revision tracking and collection association
   */
  async createWithRevisions(
    contentField: TablesInsert<'content_fields'>,
    revisionConfig?: {
      enabled: boolean;
      createdBy?: string;
      metadata?: Record<string, unknown>;
    },
    collectionConfig?: {
      collectionName?: string;
      collectionId?: string;
      siteId: string;
    }
  ): Promise<ContentFieldRow | null> {
    // Handle collection association
    const finalContentField = { ...contentField };

    if (collectionConfig) {
      if (collectionConfig.collectionId) {
        finalContentField.collection_id = collectionConfig.collectionId;
      } else if (collectionConfig.collectionName) {
        try {
          const collection = await fieldCollectionsService.getOrCreate(
            collectionConfig.collectionName,
            collectionConfig.siteId
          );
          finalContentField.collection_id = collection.id;
        } catch (error) {
          console.error('Error creating/getting collection:', error);
          // Continue without collection association if it fails
        }
      }
    }

    // Create the content field first
    const createdField = await this.create(finalContentField);

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
   * Update a content field with optional revision tracking and collection association
   */
  async updateWithRevisions(
    id: string,
    updates: TablesUpdate<'content_fields'>,
    revisionConfig?: {
      enabled: boolean;
      createdBy?: string;
      metadata?: Record<string, unknown>;
    },
    collectionConfig?: {
      collectionName?: string;
      collectionId?: string;
      siteId: string;
    }
  ): Promise<ContentFieldRow | null> {
    // Handle collection association
    const finalUpdates = { ...updates };

    if (collectionConfig) {
      if (collectionConfig.collectionId) {
        finalUpdates.collection_id = collectionConfig.collectionId;
      } else if (collectionConfig.collectionName) {
        try {
          const collection = await fieldCollectionsService.getOrCreate(
            collectionConfig.collectionName,
            collectionConfig.siteId
          );
          finalUpdates.collection_id = collection.id;
        } catch (error) {
          console.error('Error creating/getting collection:', error);
          // Continue without collection association if it fails
        }
      }
    }

    // Check if we need to create a revision before updating
    let shouldCreateRevision = false;
    let oldField: ContentFieldRow | null = null;

    if (revisionConfig?.enabled && finalUpdates.field_value !== undefined) {
      oldField = await this.getById(id);
      shouldCreateRevision =
        !!oldField && oldField.field_value !== finalUpdates.field_value;
    }

    // Update the content field
    const updatedField = await this.update(id, finalUpdates);

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
   * Get content fields by collection
   */
  async getByCollectionId(collectionId: string): Promise<ContentFieldRow[]> {
    const { data, error } = await this._supabase
      .from('content_fields')
      .select('*')
      .eq('collection_id', collectionId);
    if (error) {
      console.error('Error fetching content fields by collection id:', error);
    }
    return data ?? [];
  }

  /**
   * Get content fields by collection name
   */
  async getByCollectionName(
    collectionName: string,
    siteId: string
  ): Promise<ContentFieldRow[]> {
    const collection = await fieldCollectionsService.getByName(
      collectionName,
      siteId
    );
    if (!collection) {
      return [];
    }
    return this.getByCollectionId(collection.id);
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

  async getByFieldName(fieldName: string): Promise<ContentFieldRow | null> {
    const { data, error } = await this._supabase
      .from('content_fields')
      .select('*')
      .eq('field_name', fieldName)
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
