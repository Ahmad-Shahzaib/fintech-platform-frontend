// redux/thunks/networkThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import axios from 'axios';

export const fetchNetworkById = createAsyncThunk(
  'networks/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/edit/network/${id}`);
      // API returns { message, network: { ... } }
      const data = response.data?.network ?? response.data?.data ?? response.data;
      return data;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || err.message || 'Failed to fetch network';
        return rejectWithValue(message);
      }
      return rejectWithValue('Network error');
    }
  }
);

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

export const createNetwork = createAsyncThunk(
  'networks/create',
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin/store/networks', payload);
      const data = response.data?.data ?? response.data;
      return data;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || err.message || 'Failed to create network';
        return rejectWithValue(message);
      }
      return rejectWithValue('Network error');
    }
  }
);

export const updateNetwork = createAsyncThunk(
  'networks/update',
  async ({ id, ...payload }: { id: number; [key: string]: any }, { rejectWithValue }) => {
    try {
      // use admin networks endpoint for update
      const response = await api.post(`/admin/networks/${id}`, payload);
      const data = response.data?.data ?? response.data;
      return data;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || err.message || 'Failed to update network';
        return rejectWithValue(message);
      }
      return rejectWithValue('Network error');
    }
  }
);