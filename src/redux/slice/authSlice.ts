<<<<<<< HEAD
// In your authSlice.ts file
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { registerUser, loginUser } from '../thunk/authThunk';
=======
// redux/slice/authSlice.ts
import { createSlice, PayloadAction, createAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  email_verified?: boolean;
}
>>>>>>> dc389fb49d188bb7b44892c1840e2c6efd14abd1

interface AuthState {
  user: any | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
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
<<<<<<< HEAD
      // --- Register User Cases ---
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<any>) => {
=======
      .addCase(registerUserPending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUserFulfilled, (state, action: PayloadAction<User>) => {
>>>>>>> dc389fb49d188bb7b44892c1840e2c6efd14abd1
        state.isLoading = false;
        // action.payload may be { user, token } (we normalized it in the thunk)
        state.user = action.payload?.user ?? action.payload;
        state.token = action.payload?.token ?? state.token;
        state.error = null;
      })
<<<<<<< HEAD
      .addCase(registerUser.rejected, (state, action) => {
=======
      .addCase(registerUserRejected, (state, action: PayloadAction<string>) => {
>>>>>>> dc389fb49d188bb7b44892c1840e2c6efd14abd1
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
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;