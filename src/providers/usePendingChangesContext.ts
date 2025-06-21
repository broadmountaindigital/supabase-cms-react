import { useContext } from 'react';
import { PendingChangesContext } from './PendingChangesContext';
import type { PendingChangesContextValue } from './PendingChangesContext';

export function usePendingChangesContext(): PendingChangesContextValue {
  const ctx = useContext(PendingChangesContext);
  if (!ctx)
    throw new Error(
      'usePendingChangesContext must be used within PendingChangesProvider'
    );
  return ctx;
}
