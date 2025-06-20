import { supabase } from '@/lib/utils/supabase';
import type {
  ContentFieldRevision,
  CreateRevisionParams,
  PublishRevisionParams,
  RollbackRevisionParams,
  RevisionHistoryParams,
  RevisionHistoryResponse,
  RevisionServiceResponse,
  RevisionComparison,
  BatchRevisionOperation,
  BatchRevisionResult,
} from '@/types/RevisionTypes';

/**
 * Service for managing content field revisions
 * Provides CRUD operations and revision-specific functionality
 *
 * ⚠️ IMPORTANT: This service requires the content revision database migration to be applied first:
 * Run: npx supabase db push (or your migration command)
 * The migration file: supabase/migrations/20250616144303_add_content_revision_support.sql
 *
 * This service will not work correctly until the migration is applied and the database
 * schema is updated with the content_field_revisions table and related functions.
 */
class ContentFieldRevisionsService {
  constructor(private readonly _supabase = supabase) {}

  /**
   * Get all revisions for a specific content field
   */
  async getRevisionHistory(
    params: RevisionHistoryParams
  ): Promise<RevisionHistoryResponse> {
    const {
      content_field_id,
      limit = 20,
      offset = 0,
      include_unpublished = true,
      created_by,
      date_from,
      date_to,
    } = params;

    let query = this._supabase
      .from('content_field_revisions')
      .select('*')
      .eq('content_field_id', content_field_id)
      .order('revision_number', { ascending: false });

    // Apply filters
    if (!include_unpublished) {
      query = query.eq('is_published', true);
    }

    if (created_by) {
      query = query.eq('created_by', created_by);
    }

    if (date_from) {
      query = query.gte('created_at', date_from);
    }

    if (date_to) {
      query = query.lte('created_at', date_to);
    }

    // Get total count
    const { count } = await this._supabase
      .from('content_field_revisions')
      .select('*', { count: 'exact', head: true })
      .eq('content_field_id', content_field_id);

    // Get paginated results
    const { data, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching revision history:', error);
      return {
        revisions: [],
        total_count: 0,
        has_more: false,
      };
    }

    const revisions = data ?? [];
    const total_count = count ?? 0;
    const has_more = offset + limit < total_count;

    // Find current and published revisions
    const current_revision = revisions.find((r) => r.is_current);
    const published_revision = revisions.find((r) => r.is_published);

    return {
      revisions,
      total_count,
      has_more,
      current_revision,
      published_revision,
    };
  }

  /**
   * Get a specific revision by ID
   */
  async getRevisionById(id: string): Promise<ContentFieldRevision | null> {
    const { data, error } = await this._supabase
      .from('content_field_revisions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching revision by ID:', error);
      return null;
    }

    return data;
  }

  /**
   * Create a new revision
   */
  async createRevision(
    params: CreateRevisionParams
  ): Promise<RevisionServiceResponse<ContentFieldRevision>> {
    const { content_field_id, field_value, created_by, metadata } = params;

    try {
      // Use the database function for creating revisions
      const { data, error } = await this._supabase.rpc(
        'create_content_field_revision',
        {
          p_content_field_id: content_field_id,
          p_field_value: field_value,
          p_created_by: created_by,
        }
      );

      if (error) {
        console.error('Error creating revision:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      // Get the created revision
      const revision = await this.getRevisionById(data);

      if (!revision) {
        return {
          success: false,
          error: 'Failed to retrieve created revision',
        };
      }

      // Update metadata if provided
      if (metadata && Object.keys(metadata).length > 0) {
        const { error: metadataError } = await this._supabase
          .from('content_field_revisions')
          .update({ metadata: metadata as never })
          .eq('id', revision.id);

        if (metadataError) {
          console.error('Error updating revision metadata:', metadataError);
        }
      }

      return {
        success: true,
        data: revision,
        revision_id: revision.id,
      };
    } catch (error) {
      console.error('Error in createRevision:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Publish a revision
   */
  async publishRevision(
    params: PublishRevisionParams
  ): Promise<RevisionServiceResponse<boolean>> {
    const { revision_id, published_by } = params;

    try {
      // Use the database function for publishing revisions
      const { data, error } = await this._supabase.rpc(
        'publish_content_field_revision',
        {
          p_revision_id: revision_id,
          p_published_by: published_by,
        }
      );

      if (error) {
        console.error('Error publishing revision:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        data: data,
        revision_id,
      };
    } catch (error) {
      console.error('Error in publishRevision:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Rollback to a specific revision
   */
  async rollbackToRevision(
    params: RollbackRevisionParams
  ): Promise<RevisionServiceResponse<ContentFieldRevision>> {
    const { revision_id, created_by } = params;

    try {
      // Use the database function for rollback
      const { data, error } = await this._supabase.rpc('rollback_to_revision', {
        p_revision_id: revision_id,
        p_created_by: created_by,
      });

      if (error) {
        console.error('Error rolling back revision:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      // Get the new revision created by rollback
      const newRevision = await this.getRevisionById(data);

      if (!newRevision) {
        return {
          success: false,
          error: 'Failed to retrieve rollback revision',
        };
      }

      return {
        success: true,
        data: newRevision,
        revision_id: newRevision.id,
      };
    } catch (error) {
      console.error('Error in rollbackToRevision:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Compare two revisions
   */
  async compareRevisions(
    oldRevisionId: string,
    newRevisionId: string
  ): Promise<RevisionComparison | null> {
    try {
      const [oldRevision, newRevision] = await Promise.all([
        this.getRevisionById(oldRevisionId),
        this.getRevisionById(newRevisionId),
      ]);

      if (!oldRevision || !newRevision) {
        console.error('One or both revisions not found for comparison');
        return null;
      }

      // Simple text comparison - in a real implementation, you might use a more sophisticated diff algorithm
      const changes = this._calculateTextChanges(
        oldRevision.field_value || '',
        newRevision.field_value || ''
      );

      return {
        old_revision: oldRevision,
        new_revision: newRevision,
        changes,
        summary: {
          additions: 0, // Not implemented in simple text comparison
          deletions: 0, // Not implemented in simple text comparison
          modifications: changes.filter((c) => c.type === 'modification')
            .length,
        },
      };
    } catch (error) {
      console.error('Error comparing revisions:', error);
      return null;
    }
  }

  /**
   * Delete a revision (soft delete by archiving)
   */
  async deleteRevision(
    revisionId: string
  ): Promise<RevisionServiceResponse<boolean>> {
    try {
      const { error } = await this._supabase
        .from('content_field_revisions')
        .update({
          metadata: { archived: true, archived_at: new Date().toISOString() },
        })
        .eq('id', revisionId);

      if (error) {
        console.error('Error archiving revision:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      console.error('Error in deleteRevision:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Batch operations on revisions
   */
  async batchOperation(
    operation: BatchRevisionOperation
  ): Promise<BatchRevisionResult> {
    const { operation: op, revision_ids, params } = operation;
    const results: BatchRevisionResult = {
      successful: [],
      failed: [],
      total_processed: revision_ids.length,
    };

    for (const revisionId of revision_ids) {
      try {
        let success = false;

        switch (op) {
          case 'publish': {
            const publishResult = await this.publishRevision({
              revision_id: revisionId,
              published_by: params?.published_by as string | undefined,
            });
            success = publishResult.success;
            break;
          }

          case 'archive': {
            const archiveResult = await this.deleteRevision(revisionId);
            success = archiveResult.success;
            break;
          }

          case 'delete': {
            // Permanent delete (use with caution)
            const { error } = await this._supabase
              .from('content_field_revisions')
              .delete()
              .eq('id', revisionId);
            success = !error;
            break;
          }

          default:
            results.failed.push({
              revision_id: revisionId,
              error: `Unsupported operation: ${op}`,
            });
            continue;
        }

        if (success) {
          results.successful.push(revisionId);
        } else {
          results.failed.push({
            revision_id: revisionId,
            error: `Failed to ${op} revision`,
          });
        }
      } catch (error) {
        results.failed.push({
          revision_id: revisionId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  /**
   * Get current revision for a content field
   */
  async getCurrentRevision(
    contentFieldId: string
  ): Promise<ContentFieldRevision | null> {
    const { data, error } = await this._supabase
      .from('content_field_revisions')
      .select('*')
      .eq('content_field_id', contentFieldId)
      .eq('is_current', true)
      .single();

    if (error) {
      console.error('Error fetching current revision:', error);
      return null;
    }

    return data;
  }

  /**
   * Get published revision for a content field
   */
  async getPublishedRevision(
    contentFieldId: string
  ): Promise<ContentFieldRevision | null> {
    const { data, error } = await this._supabase
      .from('content_field_revisions')
      .select('*')
      .eq('content_field_id', contentFieldId)
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching published revision:', error);
      return null;
    }

    return data;
  }

  /**
   * Simple text change calculation
   * In a production environment, you might want to use a more sophisticated diff library
   */
  private _calculateTextChanges(oldText: string, newText: string) {
    // This is a very basic implementation - for production use, consider libraries like diff or diff2html
    const changes = [];

    if (oldText !== newText) {
      changes.push({
        type: 'modification' as const,
        old_value: oldText,
        new_value: newText,
        position: 0,
        length: Math.max(oldText.length, newText.length),
      });
    }

    return changes;
  }
}

export const contentFieldRevisionsService = new ContentFieldRevisionsService();
