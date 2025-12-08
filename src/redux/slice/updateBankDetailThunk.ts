import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from '@/lib/axios';

export interface UpdateBankDetailPayload {
  id: number;
  bank_name?: string;
  account_title?: string;
  account_number?: string;
  iban?: string | null;
  swift_code?: string | null;
}

export const updateBankDetail = createAsyncThunk(
  'bankDetails/update',
  async (payload: UpdateBankDetailPayload, { rejectWithValue }) => {
    try {
      const { id, ...body } = payload;
      const { data } = await axios.put(`/bank-details/update/${id}`, body);
      return data;
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Failed to update bank detail';
      return rejectWithValue(message);
    }
  }
);

export default updateBankDetail;
