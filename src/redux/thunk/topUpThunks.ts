import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import axios from 'axios';

// The payload is flexible — backend may require specific fields.
// Use a loose type so callers can pass the exact shape expected by the API.
export type TopUpPayload = Record<string, any>;

export const createTopUpRequest = createAsyncThunk(
    'topup/createRequest',
    async (payload: TopUpPayload, { rejectWithValue }) => {
        try {
            const response = await api.post('/topup/request', payload);

            // Normalize response: most endpoints return `{ message, data: {...} }`.
            const data = response.data?.data ?? response.data;
            return { message: response.data?.message ?? null, data };
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                const serverMsg = err.response?.data?.message;
                return rejectWithValue(serverMsg || err.message || 'Failed to create top-up request');
            }
            return rejectWithValue('Network error');
        }
    }
);
