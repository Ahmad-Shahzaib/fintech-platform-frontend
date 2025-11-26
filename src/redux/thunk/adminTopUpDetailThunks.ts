
import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import axios from 'axios';

export const fetchTopUpDetail = createAsyncThunk(
    'adminTopUpDetail/fetch',
    async (topUpId: number, { rejectWithValue }) => {
        try {
            const response = await api.get(`/admin/topup/${topUpId}`);
            return response.data.data; // The response structure has the data inside a "data" property
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data?.message || err.message || 'Failed to fetch top-up details';
                return rejectWithValue(message);
            }
            return rejectWithValue('Network error');
        }
    }
);