import React, {
  createContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { PendingChangesService } from '../lib/services/PendingChanges.service';
import { contentFieldsService } from '../lib/services/ContentFields.service';
import { useSiteContext } from './useSiteContext';
import type {
  PendingChange,
  PendingChangesConfig,
  SaveResult,
  PendingChangesCallbacks,
} from '../types/PendingChangesTypes';

export interface PendingChangesContextValue {
  changes: PendingChange[];
  hasChanges: boolean;
  changeCount: number;
  isSaving: boolean;
  saveAll: () => Promise<SaveResult>;
  clearAll: () => void;
  retryFailedChanges: () => Promise<SaveResult>;
  getSavingChanges: () => PendingChange[];
  getErrorChanges: () => PendingChange[];
  addChange: (
    fieldName: string,
    fieldId: string | null,
    newValue: string,
    originalValue: string
  ) => void;
  removeChange: (fieldName: string, fieldId: string | null) => void;
  getChange: (
    fieldName: string,
    fieldId: string | null
  ) => PendingChange | undefined;
  updateConfig: (config: Partial<PendingChangesConfig>) => void;
  lastSaveResult: SaveResult | null;
  onFieldSaved: (
    callback: (
      fieldName: string,
      fieldId: string | null,
      newValue: string
    ) => void
  ) => () => void;
}

const PendingChangesContext = createContext<
  PendingChangesContextValue | undefined
>(undefined);

export const PendingChangesProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { siteId } = useSiteContext();
  const [changes, setChanges] = useState<PendingChange[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveResult, setLastSaveResult] = useState<SaveResult | null>(null);
  const [fieldCallbacks, setFieldCallbacks] = useState<
    Map<
      string,
      (fieldName: string, fieldId: string | null, newValue: string) => void
    >
  >(new Map());

  // Create site-aware service instance
  const pendingChangesService = useMemo(() => {
    const siteAwareContentFieldsService = siteId
      ? contentFieldsService.withSite(siteId)
      : contentFieldsService;

    return new PendingChangesService({}, {}, siteAwareContentFieldsService);
  }, [siteId]);

  // Subscribe to service changes
  useEffect(() => {
    const updateChanges = () => {
      setChanges(pendingChangesService.getChanges());
      setIsSaving(pendingChangesService.isSaveInProgress());
    };

    // Initial state
    updateChanges();

    // Set up callbacks to update state
    const serviceCallbacks: PendingChangesCallbacks = {
      onChangesAdded: () => updateChanges(),
      onChangesSaved: (result) => {
        setLastSaveResult(result);
        updateChanges();
      },
      onChangesCleared: () => updateChanges(),
      onError: (error) => {
        console.error('PendingChangesService error:', error);
      },
      onFieldSaved: (fieldName, fieldId, newValue) => {
        fieldCallbacks.forEach((callback) => {
          callback(fieldName, fieldId, newValue);
        });
      },
    };

    pendingChangesService.updateCallbacks(serviceCallbacks);

    return () => {
      pendingChangesService.updateCallbacks({});
    };
  }, [fieldCallbacks, pendingChangesService]);

  const onFieldSaved = useCallback(
    (
      callback: (
        fieldName: string,
        fieldId: string | null,
        newValue: string
      ) => void
    ) => {
      const callbackKey = Math.random().toString(36).substr(2, 9);
      setFieldCallbacks((prev) => new Map(prev).set(callbackKey, callback));
      return () => {
        setFieldCallbacks((prev) => {
          const newMap = new Map(prev);
          newMap.delete(callbackKey);
          return newMap;
        });
      };
    },
    []
  );

  const saveAll = useCallback(async (): Promise<SaveResult> => {
    setIsSaving(true);
    try {
      const result = await pendingChangesService.saveAll();
      setLastSaveResult(result);
      return result;
    } finally {
      setIsSaving(false);
    }
  }, [pendingChangesService]);

  const clearAll = useCallback(() => {
    pendingChangesService.clearAll();
  }, [pendingChangesService]);

  const retryFailedChanges = useCallback(async (): Promise<SaveResult> => {
    setIsSaving(true);
    try {
      const result = await pendingChangesService.retryFailedChanges();
      setLastSaveResult(result);
      return result;
    } finally {
      setIsSaving(false);
    }
  }, [pendingChangesService]);

  const addChange = useCallback(
    (
      fieldName: string,
      fieldId: string | null,
      newValue: string,
      originalValue: string
    ) => {
      pendingChangesService.addChange(
        fieldName,
        fieldId,
        newValue,
        originalValue
      );
    },
    [pendingChangesService]
  );

  const removeChange = useCallback(
    (fieldName: string, fieldId: string | null) => {
      pendingChangesService.removeChange(fieldName, fieldId);
    },
    [pendingChangesService]
  );

  const getChange = useCallback(
    (fieldName: string, fieldId: string | null) => {
      return pendingChangesService.getChange(fieldName, fieldId);
    },
    [pendingChangesService]
  );

  const updateConfig = useCallback(
    (newConfig: Partial<PendingChangesConfig>) => {
      pendingChangesService.updateConfig(newConfig);
    },
    [pendingChangesService]
  );

  const value: PendingChangesContextValue = {
    changes,
    hasChanges: changes.length > 0,
    changeCount: changes.length,
    isSaving,
    saveAll,
    clearAll,
    retryFailedChanges,
    getSavingChanges: () => pendingChangesService.getSavingChanges(),
    getErrorChanges: () => pendingChangesService.getErrorChanges(),
    addChange,
    removeChange,
    getChange,
    updateConfig,
    lastSaveResult,
    onFieldSaved,
  };

  return (
    <PendingChangesContext.Provider value={value}>
      {children}
    </PendingChangesContext.Provider>
  );
};

export { PendingChangesContext };
