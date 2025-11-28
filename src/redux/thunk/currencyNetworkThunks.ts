import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import axios from 'axios';

export interface CurrencyNetworkDetail {
  id: number;
  currency_id: number;
  network_id: number;
  contract_address: string | null;
  is_active: number;
  min_transaction_amount: string;
  max_transaction_amount: string;
  network_fee_estimate_aud: string;
  created_at?: string;
  updated_at?: string;
}

export const fetchCurrencyNetworkDetail = createAsyncThunk(
  'currencyNetwork/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      const res = await api.get(`/admin/edit/currency-network/${id}`);
      // API may return { message, data: { ... } }
      return res.data?.data ?? res.data;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || err.message || 'Failed to fetch currency-network';
        return rejectWithValue(message);
      }
      return rejectWithValue('Network error');
    }
  }
);

export const createCurrencyNetwork = createAsyncThunk(
  'currencyNetwork/create',
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await api.post('/admin/currency-network', payload);
      return res.data?.data ?? res.data;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || err.message || 'Failed to create currency-network';
        return rejectWithValue(message);
      }
      return rejectWithValue('Network error');
    }
  }
);

export const updateCurrencyNetwork = createAsyncThunk(
  'currencyNetwork/update',
  async ({ id, payload }: { id: number; payload: any }, { rejectWithValue }) => {
    try {
      // Server on this project often accepts POST for updates on admin routes
      const res = await api.post(`/admin/currency-network/${id}`, payload);
      return res.data?.data ?? res.data;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || err.message || 'Failed to update currency-network';
        return rejectWithValue(message);
      }
      return rejectWithValue('Network error');
    }
  }
);

export default {};
