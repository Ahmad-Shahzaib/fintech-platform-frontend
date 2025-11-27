import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import axios from 'axios';

// Fetch list of currencies with their networks
export const fetchCurrencies = createAsyncThunk(
    'currency/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/currencies');
            const data = response.data?.data ?? response.data;
            return data;
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data?.message || err.message || 'Failed to fetch currencies';
                return rejectWithValue(message);
            }
            return rejectWithValue('Network error');
        }
    }
);

// Add a currency via admin API
export const addCurrency = createAsyncThunk(
    'currency/add',
    async (payload: any, { rejectWithValue }) => {
        try {
            // Normalize numeric and boolean fields before sending
            const body = {
                ...payload,
                decimals: payload.decimals !== undefined && payload.decimals !== '' ? Number(payload.decimals) : undefined,
                min_amount: payload.min_amount !== undefined && payload.min_amount !== '' ? Number(payload.min_amount) : undefined,
                max_amount: payload.max_amount !== undefined && payload.max_amount !== '' ? Number(payload.max_amount) : undefined,
                sort_order: payload.sort_order !== undefined && payload.sort_order !== '' ? Number(payload.sort_order) : undefined,
                is_active: Boolean(payload.is_active),
            };

            const response = await api.post('/admin/store/currency', body);
            const data = response.data?.data ?? response.data;
            return data;
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data?.message || err.message || 'Failed to add currency';
                return rejectWithValue(message);
            }
            return rejectWithValue('Network error');
        }
    }
);

// Update a currency by ID
export const updateCurrency = createAsyncThunk(
    'currency/update',
    async ({ id, payload }: { id: number; payload: any }, { rejectWithValue }) => {
        try {
            const body = {
                ...payload,
                decimals: payload.decimals !== undefined && payload.decimals !== '' ? Number(payload.decimals) : undefined,
                min_amount: payload.min_amount !== undefined && payload.min_amount !== '' ? Number(payload.min_amount) : undefined,
                max_amount: payload.max_amount !== undefined && payload.max_amount !== '' ? Number(payload.max_amount) : undefined,
                sort_order: payload.sort_order !== undefined && payload.sort_order !== '' ? Number(payload.sort_order) : undefined,
                is_active: Boolean(payload.is_active),
            };

            // The API supports POST for updates on this route (server returned MethodNotAllowed for PUT)
            const response = await api.post(`/admin/currencies/${id}`, body);
            const data = response.data?.data ?? response.data;
            return data;
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data?.message || err.message || 'Failed to update currency';
                return rejectWithValue(message);
            }
            return rejectWithValue('Network error');
        }
    }
);

// Fetch a single currency by id (for view/edit)
export const fetchCurrencyDetail = createAsyncThunk(
    'currency/fetchById',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.get(`/admin/edit/currency/${id}`);
            // API returns { message, currency: { ... } }
            const data = response.data?.currency ?? response.data?.data ?? response.data;
            return data;
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data?.message || err.message || 'Failed to fetch currency';
                return rejectWithValue(message);
            }
            return rejectWithValue('Network error');
        }
    }
);
