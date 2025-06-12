import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface EditingToolsState {
  isInEditMode: boolean;
}

const initialState: EditingToolsState = {
  isInEditMode: false,
};

export const editingToolsSlice = createSlice({
  name: 'editingTools',
  initialState,
  reducers: {
    setEditMode(state, action: PayloadAction<boolean>) {
      state.isInEditMode = action.payload;
    },
    toggleEditMode(state) {
      state.isInEditMode = !state.isInEditMode;
    },
  },
});

export const { setEditMode, toggleEditMode } = editingToolsSlice.actions;
export default editingToolsSlice.reducer;
