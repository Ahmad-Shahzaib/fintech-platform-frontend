import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from '@/lib/axios';

// Fetch bank details for payment method id 1 (static as requested)
export const fetchBankDetails = createAsyncThunk(
  'bankDetails/fetch',
  async (methodId: number = 1, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/payment-methods/${methodId}/details`);
      // API returns { status: true, method: {...}, details: [...] }
      return data?.details || [];
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Failed to fetch bank details';
      return rejectWithValue(message);
    }
  }
);

export default fetchBankDetails;
