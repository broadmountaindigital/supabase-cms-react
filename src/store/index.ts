import { configureStore } from '@reduxjs/toolkit';
import editingToolsReducer from './slices/editingToolsSlice';

export const store = configureStore({
  reducer: {
    editingTools: editingToolsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
