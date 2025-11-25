// In your authSlice.ts file
import { createSlice, PayloadAction, createAction } from '@reduxjs/toolkit';
import { registerUser, loginUser, resendVerification } from '../thunk/authThunk';
import { User } from '../../types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  // resend verification state
  resendLoading: boolean;
  resendError: string | null;
  resendMessage: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  resendLoading: false,
  resendError: null,
  resendMessage: null,
};

export const registerUserPending = createAction('auth/registerUser/pending');
export const registerUserFulfilled = createAction<User>('auth/registerUser/fulfilled');
export const registerUserRejected = createAction<string>('auth/registerUser/rejected');

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // your other reducers like logout, clearError, etc.
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // --- Register User Cases ---
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        // action.payload may be { user, token } (we normalized it in the thunk)
        state.user = action.payload?.user ?? action.payload;
        state.token = action.payload?.token ?? state.token;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        // action.payload contains the error message from rejectWithValue
        state.error = action.payload as string;
      })
      // --- Login User Cases ---
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Resend verification cases
    builder
      .addCase(resendVerification.pending, (state) => {
        state.resendLoading = true;
        state.resendError = null;
        state.resendMessage = null;
      })
      .addCase(resendVerification.fulfilled, (state, action: PayloadAction<any>) => {
        state.resendLoading = false;
        state.resendMessage = action.payload as string;
        state.resendError = null;
      })
      .addCase(resendVerification.rejected, (state, action) => {
        state.resendLoading = false;
        state.resendError = (action.payload as string) || 'Failed to resend verification';
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;