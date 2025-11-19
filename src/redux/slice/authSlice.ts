// redux/slice/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase('auth/registerUser/pending' as any, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase('auth/registerUser/fulfilled' as any, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase('auth/registerUser/rejected' as any, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, logout } = authSlice.actions;
export default authSlice.reducer;