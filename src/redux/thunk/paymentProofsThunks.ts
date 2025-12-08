import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import axios from 'axios';

// Fetch current user's payment proofs (GET /payments/my-proofs)
export const fetchMyProofs = createAsyncThunk(
  'payments/fetchMyProofs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/payments/my-proofs');
      // return the whole response data (contains data and pagination)
      return response.data;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || err.message || 'Failed to fetch proofs';
        return rejectWithValue(message);
      }
      return rejectWithValue('Network error');
    }
  }
);

export default fetchMyProofs;
