import { contentFieldsService } from './ContentFields.service';
import type {
  PendingChange,
  PendingChangesConfig,
  SaveResult,
  PendingChangesCallbacks,
} from '../../types/PendingChangesTypes';

class PendingChangesService {
  private changes: Map<string, PendingChange> = new Map();
  private config: PendingChangesConfig;
  private callbacks: PendingChangesCallbacks;
  private autoSaveTimeout: NodeJS.Timeout | null = null;
  private isSaving = false;
  private contentFieldsService: typeof contentFieldsService;

  constructor(
    config: PendingChangesConfig = {},
    callbacks: PendingChangesCallbacks = {},
    contentFieldsServiceInstance?: typeof contentFieldsService
  ) {
    this.config = {
      autoSave: false,
      autoSaveDelay: 2000,
      showIndividualIndicators: true,
      batchSave: true,
      ...config,
    };
    this.callbacks = callbacks;
    this.contentFieldsService =
      contentFieldsServiceInstance || contentFieldsService;
  }

  /**
   * Add or update a pending change
   */
  addChange(
    fieldName: string,
    fieldId: string | null,
    newValue: string,
    originalValue: string
  ): void {
    const changeId = this.generateChangeId(fieldName, fieldId);

    // Don't add if value hasn't actually changed
    if (newValue === originalValue) {
      this.removeChange(fieldName, fieldId);
      return;
    }

    const change: PendingChange = {
      id: changeId,
      fieldName,
      fieldId,
      newValue,
      originalValue,
      timestamp: Date.now(),
      isNewField: fieldId === null,
      status: 'pending',
    };

    this.changes.set(changeId, change);

    // Trigger auto-save if enabled
    if (this.config.autoSave) {
      this.scheduleAutoSave();
    }

    // Notify callbacks
    this.callbacks.onChangesAdded?.([change]);
  }

  /**
   * Remove a pending change
   */
  removeChange(fieldName: string, fieldId: string | null): void {
    const changeId = this.generateChangeId(fieldName, fieldId);
    this.changes.delete(changeId);
  }

  /**
   * Get all pending changes
   */
  getChanges(): PendingChange[] {
    return Array.from(this.changes.values());
  }

  /**
   * Get pending changes for a specific field
   */
  getChange(
    fieldName: string,
    fieldId: string | null
  ): PendingChange | undefined {
    const changeId = this.generateChangeId(fieldName, fieldId);
    return this.changes.get(changeId);
  }

  /**
   * Check if there are any pending changes
   */
  hasChanges(): boolean {
    return this.changes.size > 0;
  }

  /**
   * Get the count of pending changes
   */
  getChangeCount(): number {
    return this.changes.size;
  }

  /**
   * Save all pending changes
   */
  async saveAll(): Promise<SaveResult> {
    if (this.isSaving) {
      throw new Error('Save operation already in progress');
    }

    if (!this.hasChanges()) {
      return {
        success: true,
        savedCount: 0,
        failedCount: 0,
        failures: [],
        duration: 0,
      };
    }

    this.isSaving = true;
    const startTime = Date.now();
    const changes = this.getChanges();
    const failures: Array<{ fieldName: string; error: string }> = [];
    let savedCount = 0;

    // Update all changes to 'saving' status
    changes.forEach((change) => {
      change.status = 'saving';
    });

    try {
      if (this.config.batchSave) {
        // Batch save all changes
        const results = await Promise.allSettled(
          changes.map((change) => this.saveChange(change))
        );

        results.forEach((result, index) => {
          const change = changes[index];
          if (result.status === 'fulfilled') {
            change.status = 'saved';
            savedCount++;
          } else {
            change.status = 'error';
            change.error = result.reason?.message || 'Unknown error';
            failures.push({
              fieldName: change.fieldName,
              error: change.error || 'Unknown error',
            });
          }
        });
      } else {
        // Save changes sequentially
        for (const change of changes) {
          try {
            await this.saveChange(change);
            change.status = 'saved';
            savedCount++;
          } catch (error) {
            change.status = 'error';
            change.error =
              error instanceof Error ? error.message : 'Unknown error';
            failures.push({
              fieldName: change.fieldName,
              error: change.error,
            });
          }
        }
      }

      const duration = Date.now() - startTime;
      const result: SaveResult = {
        success: failures.length === 0,
        savedCount,
        failedCount: failures.length,
        failures,
        duration,
      };

      // Clear successful changes
      changes.forEach((change) => {
        if (change.status === 'saved') {
          this.changes.delete(change.id);
          // Notify field-specific callback
          this.callbacks.onFieldSaved?.(
            change.fieldName,
            change.fieldId,
            change.newValue
          );
        }
      });

      // Notify callbacks
      this.callbacks.onChangesSaved?.(result);

      return result;
    } finally {
      this.isSaving = false;
    }
  }

  /**
   * Clear all pending changes
   */
  clearAll(): void {
    this.changes.clear();
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
      this.autoSaveTimeout = null;
    }
    this.callbacks.onChangesCleared?.();
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<PendingChangesConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Update callbacks
   */
  updateCallbacks(newCallbacks: PendingChangesCallbacks): void {
    this.callbacks = { ...this.callbacks, ...newCallbacks };
  }

  /**
   * Check if a save operation is in progress
   */
  isSaveInProgress(): boolean {
    return this.isSaving;
  }

  /**
   * Get changes that are currently being saved
   */
  getSavingChanges(): PendingChange[] {
    return this.getChanges().filter((change) => change.status === 'saving');
  }

  /**
   * Get changes that have errors
   */
  getErrorChanges(): PendingChange[] {
    return this.getChanges().filter((change) => change.status === 'error');
  }

  /**
   * Retry saving failed changes
   */
  async retryFailedChanges(): Promise<SaveResult> {
    const failedChanges = this.getErrorChanges();
    if (failedChanges.length === 0) {
      return {
        success: true,
        savedCount: 0,
        failedCount: 0,
        failures: [],
        duration: 0,
      };
    }

    // Reset failed changes to pending status
    failedChanges.forEach((change) => {
      change.status = 'pending';
      delete change.error;
    });

    return this.saveAll();
  }

  /**
   * Private method to save a single change
   */
  private async saveChange(change: PendingChange): Promise<void> {
    if (change.isNewField) {
      const savedField = await this.contentFieldsService.create({
        field_name: change.fieldName,
        field_value: change.newValue,
      });
      if (!savedField) {
        throw new Error('Failed to create field');
      }

      // Update the change with the new field ID
      const oldChangeId = change.id;
      change.fieldId = savedField.id;
      change.id = this.generateChangeId(change.fieldName, change.fieldId);

      // Update the Map key to reflect the new field ID
      this.changes.delete(oldChangeId);
      this.changes.set(change.id, change);
    } else {
      const savedField = await this.contentFieldsService.update(
        change.fieldId!,
        {
          field_value: change.newValue,
        }
      );
      if (!savedField) {
        throw new Error('Failed to update field');
      }
    }
  }

  /**
   * Private method to generate a unique change ID
   */
  private generateChangeId(fieldName: string, fieldId: string | null): string {
    return `${fieldName}:${fieldId || 'new'}`;
  }

  /**
   * Private method to schedule auto-save
   */
  private scheduleAutoSave(): void {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }

    this.autoSaveTimeout = setTimeout(() => {
      this.saveAll().catch((error) => {
        this.callbacks.onError?.(error.message);
      });
    }, this.config.autoSaveDelay);
  }
}

// Create a singleton instance
export const pendingChangesService = new PendingChangesService();

export { PendingChangesService };
