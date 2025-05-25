import { configureStore } from '@reduxjs/toolkit';
import editingToolsReducer from './slices/editingToolsSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    editingTools: editingToolsReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
