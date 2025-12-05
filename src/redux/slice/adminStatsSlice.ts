import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from '@/lib/axios';

export interface AdminStatsState {
  loading: boolean;
  error?: string | null;
  data: {
    total_users: number;
    total_currencies: number;
    total_networks: number;
    total_topups: number;
    kyc: {
      pending: number;
      approved: number;
      rejected: number;
      total: number;
    };
  } | null;
}

const initialState: AdminStatsState = {
  loading: false,
  error: null,
  data: null,
};

// Thunk to fetch admin dashboard stats
export const fetchAdminStats = createAsyncThunk('adminStats/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axios.get('/admin/dashboard/stats');
    return data;
  } catch (err: any) {
    // try to return a readable error
    const message = err?.response?.data?.message || err.message || 'Failed to fetch admin stats';
    return rejectWithValue(message);
  }
});

const adminStatsSlice = createSlice({
  name: 'adminStats',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.data = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch';
      });
  },
});

export default adminStatsSlice.reducer;
