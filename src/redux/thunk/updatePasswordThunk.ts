import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../lib/axios';

interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const updatePassword = createAsyncThunk(
  'user/updatePassword',
  async (payload: UpdatePasswordPayload, { rejectWithValue }) => {
    try {
      const body = {
        current_password: payload.currentPassword,
        new_password: payload.newPassword,
        new_password_confirmation: payload.confirmPassword,
      };

      const response = await axios.post('/user/change-password', body);
      return response.data;
    } catch (err: any) {
      const respData = err?.response?.data;
      if (respData) return rejectWithValue(respData);
      const message = err?.message || 'Failed to update password';
      return rejectWithValue({ message });
    }
  }
);

export default updatePassword;
