import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from '@/lib/axios';

export interface BankDetailPayload {
  bank_name: string;
  account_title: string;
  account_number: string;
  iban?: string;
  swift_code?: string;
}

export const addBankDetail = createAsyncThunk(
  'bankDetails/add',
  async (payload: BankDetailPayload, { rejectWithValue }) => {
    try {
      const { data } = await axios.post('/bank-details/store', payload);
      return data;
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Failed to add bank detail';
      return rejectWithValue(message);
    }
  }
);

export default addBankDetail;
