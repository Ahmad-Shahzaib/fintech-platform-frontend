// redux/thunks/networkThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import axios from 'axios';

export const fetchNetworks = createAsyncThunk(
  'networks/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/networks');
      const data = response.data?.data ?? response.data;
      return data;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || err.message || 'Failed to fetch networks';
        return rejectWithValue(message);
      }
      return rejectWithValue('Network error');
    }
  }
);