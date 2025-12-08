import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from '@/lib/axios';

export interface UpdatePaypalDetailPayload {
  id: number;
  paypal_email?: string;
  account_name?: string;
}

export const updatePaypalDetail = createAsyncThunk(
  'paypalDetails/update',
  async (payload: UpdatePaypalDetailPayload, { rejectWithValue }) => {
    try {
      const { id, ...body } = payload;
      const { data } = await axios.post(`/paypal-details/update/${id}`, body);
      return data;
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Failed to update PayPal detail';
      return rejectWithValue(message);
    }
  }
);

export default updatePaypalDetail;
