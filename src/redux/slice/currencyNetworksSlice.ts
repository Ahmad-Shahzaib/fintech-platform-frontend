import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '../../lib/axios';

export interface CurrencyNetwork {
  id: number;
  currency: { id: number; code: string; name: string };
  network: { id: number; code: string; name: string };
  contract_address: string | null;
  min_transaction_amount: string;
  max_transaction_amount: string;
  network_fee_estimate_aud: string;
  is_active: number;
}

interface CurrencyNetworksState {
  data: CurrencyNetwork[];
  loading: boolean;
  error: string | null;
}

const initialState: CurrencyNetworksState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchCurrencyNetworks = createAsyncThunk(
  'currencyNetworks/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/currency-networks');
      // expecting { data: [...] } shape from API
      return res.data?.data ?? res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

const slice = createSlice({
  name: 'currencyNetworks',
  initialState,
  reducers: {
    clear(state) {
      state.data = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCurrencyNetworks.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCurrencyNetworks.fulfilled, (state, action: PayloadAction<CurrencyNetwork[]>) => {
      state.loading = false;
      state.data = action.payload;
    });
    builder.addCase(fetchCurrencyNetworks.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || action.error.message || 'Failed to load';
    });
  },
});

export const { clear } = slice.actions;
export default slice.reducer;
