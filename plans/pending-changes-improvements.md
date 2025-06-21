# Pending Changes Improvements Plan

## Issues Identified

1. **Changes don't show until exiting edit mode**: Currently, `MultilineEditor` only shows pending changes when `isInEditMode` is true, but the pending changes should be visible regardless of edit mode.

2. **Changes not cleared after successful save**: The `PendingChangesService` clears changes from its internal map after successful save, but the `MultilineEditor` components don't update their local state to reflect the saved values.

## Root Cause Analysis

### Issue 1: Changes not visible outside edit mode

- **Location**: `src/components/MultilineEditor.tsx` lines 85-95
- **Problem**: The `useEffect` that manages pending changes clears them when `!isInEditMode`
- **Impact**: Users can't see what changes are pending until they enter edit mode

### Issue 2: Changes not cleared after save

- **Location**: `src/lib/services/PendingChanges.service.ts` lines 175-179
- **Problem**: Service clears changes from internal map, but `MultilineEditor` components don't get notified to update their `serverValue`
- **Impact**: After successful save, components still show "Pending" indicators and don't reflect the new server state

## Implementation Plan

### Phase 1: Fix Change Visibility

- [x] **Step 1.1**: Modify `MultilineEditor` to not clear pending changes when exiting edit mode
- [x] **Step 1.2**: Update the pending changes effect to only manage registration, not visibility
- [x] **Step 1.3**: Ensure pending indicators show regardless of edit mode state

### Phase 2: Fix Change Clearing After Save

- [x] **Step 2.1**: Add callback mechanism to notify components when their changes are saved
- [x] **Step 2.2**: Update `PendingChangesService` to call field-specific callbacks on successful save
- [x] **Step 2.3**: Modify `MultilineEditor` to listen for save notifications and update `serverValue`
- [x] **Step 2.4**: Ensure components properly reflect saved state after successful save

### Phase 3: Testing and Validation

- [x] **Step 3.1**: Test that changes remain visible when exiting edit mode
- [x] **Step 3.2**: Test that changes are properly cleared after successful save
- [x] **Step 3.3**: Test that error states are handled correctly
- [x] **Step 3.4**: Test with multiple editors and global save

## Phase 4: Robust Shared Pending Changes State (Context-based)

- [x] **Step 4.1**: Create a PendingChangesContext and Provider to hold shared state
- [x] **Step 4.2**: Refactor usePendingChanges to use the context
- [ ] **Step 4.3**: Wrap the app in PendingChangesProvider
- [ ] **Step 4.4**: Test and validate shared state across all consumers

## Technical Approach

### For Issue 1:

- Remove the edit mode check in the pending changes effect
- Keep changes registered until explicitly saved or cleared
- Show pending indicators based on actual pending state, not edit mode

### For Issue 2:

- Add field-specific callbacks to the pending changes service
- When a change is successfully saved, notify the specific field component
- Update the component's `serverValue` to match the new value
- Clear the pending state for that specific field

## Files to Modify

1. `src/components/MultilineEditor.tsx`
2. `src/lib/services/PendingChanges.service.ts`
3. `src/hooks/usePendingChanges.ts`
4. `src/types/PendingChangesTypes.ts` (if new types needed)

## Success Criteria

- [x] Changes remain visible when exiting edit mode
- [x] Global save button appears when there are pending changes (regardless of edit mode)
- [x] After successful save, pending indicators disappear
- [x] After successful save, components reflect the new server state
- [x] Error handling works correctly for failed saves
- [x] Multiple editors work correctly with global save

## Notes

- Need to be careful about state synchronization between service and components
- Should maintain backward compatibility with existing API
- Consider edge cases like rapid edit mode toggling
- Ensure proper cleanup when components unmount
