import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import axios from 'axios';

// Fetch the latest top-ups for admin dashboard (/admin/topups/latest)
export const fetchAdminLatestTopUps = createAsyncThunk(
  'adminTopups/fetchLatest',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/topups/latest');
      // API returns shape like: { message: '...', data: [ ... ] }
      return response.data ?? {};
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || err.message || 'Failed to fetch latest top-ups';
        return rejectWithValue(message);
      }
      return rejectWithValue('Network error');
    }
  }
);
