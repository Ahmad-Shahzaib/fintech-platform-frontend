import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import axios from 'axios';

// Fetch available payment methods from /payment-methods
export const fetchPaymentMethods = createAsyncThunk(
  'paymentMethods/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/payment-methods');
      // API shape: { status: true, methods: [...] }
      return response.data?.methods ?? [];
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || err.message || 'Failed to fetch payment methods';
        return rejectWithValue(message);
      }
      return rejectWithValue('Network error');
    }
  }
);

export default fetchPaymentMethods;
