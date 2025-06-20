/**
 * Content Field Revision System Types
 *
 * These types define the structure for content revision tracking,
 * including revision metadata, workflow states, and integration
 * with existing content field functionality.
 */

import type { Json } from './database/supabase';

/**
 * Represents a single content field revision record
 */
export interface ContentFieldRevision {
  id: string;
  content_field_id: string;
  revision_number: number;
  parent_revision_id: string | null;
  is_published: boolean | null;
  is_current: boolean | null;
  field_value: string | null;
  field_value_hash: string | null;
  created_by: string | null;
  published_by: string | null;
  published_at: string | null;
  metadata: Json | null;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * Enhanced content field with revision tracking information
 */
export interface ContentFieldWithRevisions {
  id: string;
  site_id: string;
  field_name: string;
  field_value?: string;
  field_namespace: string;
  current_revision_id?: string;
  total_revisions: number;
  last_published_at?: string;
  last_published_by?: string;
  created_at: string;
  updated_at: string;
  // Related revision data
  current_revision?: ContentFieldRevision;
  revisions?: ContentFieldRevision[];
}

/**
 * Parameters for creating a new revision
 */
export interface CreateRevisionParams {
  content_field_id: string;
  field_value: string;
  created_by?: string;
  metadata?: Record<string, unknown>;
  parent_revision_id?: string;
}

/**
 * Parameters for publishing a revision
 */
export interface PublishRevisionParams {
  revision_id: string;
  published_by?: string;
}

/**
 * Parameters for rolling back to a specific revision
 */
export interface RollbackRevisionParams {
  revision_id: string;
  created_by?: string;
}

/**
 * Revision comparison result
 */
export interface RevisionComparison {
  old_revision: ContentFieldRevision;
  new_revision: ContentFieldRevision;
  changes: RevisionChange[];
  summary: {
    additions: number;
    deletions: number;
    modifications: number;
  };
}

/**
 * Individual change in a revision comparison
 */
export interface RevisionChange {
  type: 'addition' | 'deletion' | 'modification';
  old_value?: string;
  new_value?: string;
  position?: number;
  length?: number;
}

/**
 * Revision history query parameters
 */
export interface RevisionHistoryParams {
  content_field_id: string;
  limit?: number;
  offset?: number;
  include_unpublished?: boolean;
  created_by?: string;
  date_from?: string;
  date_to?: string;
}

/**
 * Revision history response
 */
export interface RevisionHistoryResponse {
  revisions: ContentFieldRevision[];
  total_count: number;
  has_more: boolean;
  current_revision?: ContentFieldRevision;
  published_revision?: ContentFieldRevision;
}

/**
 * Revision workflow status
 */
export type RevisionStatus = 'draft' | 'published' | 'archived' | 'current';

/**
 * Revision conflict detection result
 */
export interface RevisionConflict {
  detected: boolean;
  conflict_type: 'concurrent_edit' | 'outdated_base' | 'merge_conflict';
  conflicting_revision?: ContentFieldRevision;
  resolution_required: boolean;
  suggested_action: 'merge' | 'overwrite' | 'create_branch';
}

/**
 * Configuration for revision tracking behavior
 */
export interface RevisionConfig {
  enabled: boolean;
  auto_create: boolean;
  auto_publish: boolean;
  max_revisions?: number;
  retention_days?: number;
  conflict_detection: boolean;
  deduplication: boolean;
}

/**
 * Revision service method return types
 */
export interface RevisionServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  revision_id?: string;
  conflict?: RevisionConflict;
}

/**
 * Batch revision operations
 */
export interface BatchRevisionOperation {
  operation: 'create' | 'publish' | 'archive' | 'delete';
  revision_ids: string[];
  params?: Record<string, unknown>;
}

/**
 * Batch operation result
 */
export interface BatchRevisionResult {
  successful: string[];
  failed: Array<{
    revision_id: string;
    error: string;
  }>;
  total_processed: number;
}

/**
 * Revision metadata for extensibility
 */
export interface RevisionMetadata extends Record<string, unknown> {
  // Content-related metadata
  content_type?: string;
  content_length?: number;
  word_count?: number;

  // Workflow metadata
  approval_status?: 'pending' | 'approved' | 'rejected';
  approval_notes?: string;
  approved_by?: string;
  approved_at?: string;

  // Collaboration metadata
  collaborators?: string[];
  comments?: Array<{
    user_id: string;
    comment: string;
    created_at: string;
  }>;

  // Technical metadata
  client_info?: {
    user_agent?: string;
    ip_address?: string;
    device_type?: string;
  };

  // Custom fields for specific use cases
  custom?: Record<string, unknown>;
}

/**
 * Enhanced revision with full metadata
 */
export interface ContentFieldRevisionFull
  extends Omit<ContentFieldRevision, 'metadata'> {
  metadata: RevisionMetadata;
  // Relations
  parent_revision?: ContentFieldRevision;
  child_revisions?: ContentFieldRevision[];
  content_field?: ContentFieldWithRevisions;
}

/**
 * Revision analytics data
 */
export interface RevisionAnalytics {
  content_field_id: string;
  total_revisions: number;
  published_revisions: number;
  draft_revisions: number;
  unique_contributors: number;
  average_revision_size: number;
  most_active_contributor: string;
  last_activity: string;
  revision_frequency: {
    daily_average: number;
    weekly_average: number;
    monthly_average: number;
  };
}

/**
 * Props for revision-enabled components
 */
export interface RevisionEnabledProps {
  enableRevisions?: boolean;
  revisionConfig?: Partial<RevisionConfig>;
  onRevisionCreated?: (revision: ContentFieldRevision) => void;
  onRevisionPublished?: (revision: ContentFieldRevision) => void;
  onRevisionConflict?: (conflict: RevisionConflict) => void;
  showRevisionStatus?: boolean;
  allowRollback?: boolean;
}

/**
 * Hook return types for revision functionality
 */
export interface UseRevisionReturn {
  // Current state
  currentRevision?: ContentFieldRevision;
  revisionHistory: ContentFieldRevision[];
  isLoading: boolean;
  error?: string;

  // Actions
  createRevision: (
    params: CreateRevisionParams
  ) => Promise<RevisionServiceResponse<ContentFieldRevision>>;
  publishRevision: (
    params: PublishRevisionParams
  ) => Promise<RevisionServiceResponse<boolean>>;
  rollbackToRevision: (
    params: RollbackRevisionParams
  ) => Promise<RevisionServiceResponse<ContentFieldRevision>>;
  compareRevisions: (
    oldId: string,
    newId: string
  ) => Promise<RevisionComparison>;

  // Utilities
  refresh: () => Promise<void>;
  getRevisionById: (id: string) => ContentFieldRevision | undefined;
  isRevisionCurrent: (revision: ContentFieldRevision) => boolean;
  isRevisionPublished: (revision: ContentFieldRevision) => boolean;
}
