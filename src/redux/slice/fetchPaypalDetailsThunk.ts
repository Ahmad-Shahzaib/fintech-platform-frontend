import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from '@/lib/axios';

// Fetch PayPal details for payment method id 2
export const fetchPaypalDetails = createAsyncThunk(
  'paypalDetails/fetch',
  async (methodId: number = 2, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/payment-methods/${methodId}/details`);
      // API returns { status: true, method: {...}, details: [...] }
      return data?.details || [];
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Failed to fetch PayPal details';
      return rejectWithValue(message);
    }
  }
);

export default fetchPaypalDetails;
