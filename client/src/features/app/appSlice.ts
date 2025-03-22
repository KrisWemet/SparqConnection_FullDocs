import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  isLoading: boolean;
  darkMode: boolean;
  error: string | null;
}

const initialState: AppState = {
  isLoading: false,
  darkMode: false,
  error: null
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetAppState: () => initialState
  }
});

export const { setLoading, setDarkMode, setError, resetAppState } = appSlice.actions;

export default appSlice.reducer; 