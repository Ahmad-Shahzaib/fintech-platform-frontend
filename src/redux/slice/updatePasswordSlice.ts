import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { updatePassword } from '../thunk/updatePasswordThunk';

interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface UpdatePasswordState {
  loading: boolean;
  success: boolean;
  error: string | null; // top-level message
  message?: string | null; // success message from API
  validationErrors?: Record<string, string[]> | null; // field-specific errors from API
}

const initialState: UpdatePasswordState = {
  loading: false,
  success: false,
  error: null,
  message: null,
  validationErrors: null,
};

// Thunk is defined in '../../thunk/updatePasswordThunk'

const updatePasswordSlice = createSlice({
  name: 'updatePassword',
  initialState,
  reducers: {
    resetUpdatePassword(state) {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updatePassword.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = null;
      })
      .addCase(updatePassword.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.validationErrors = null;
        state.message = action.payload?.message ?? null;
      })
      .addCase(updatePassword.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.success = false;
        // action.payload may be an object like { errors: { ... }, message: '...' }
        const payload = action.payload as any;
        if (payload) {
          state.error = payload.message ?? null;
          state.validationErrors = payload.errors ?? null;
        } else {
          state.error = 'Failed to update password';
          state.validationErrors = null;
        }
      });
  },
});

export const { resetUpdatePassword } = updatePasswordSlice.actions;
export default updatePasswordSlice.reducer;
