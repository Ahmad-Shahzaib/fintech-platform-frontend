import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import axios from 'axios';

export interface TopUpsQuery {
    status?: string;
    page?: number;
}

export const fetchTopUps = createAsyncThunk(
    'topups/fetchList',
    async (params: TopUpsQuery = { status: '', page: 1 }, { rejectWithValue }) => {
        try {
            const query = new URLSearchParams();
            if (params.status) query.set('status', params.status);
            if (params.page) query.set('page', String(params.page));

            const response = await api.get(`/topup/my-requests?${query.toString()}`);
            // Expecting { data: [...], pagination: {...} }
            const payload = response.data ?? {};
            return payload;
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data?.message || err.message || 'Failed to fetch top-ups';
                return rejectWithValue(message);
            }
            return rejectWithValue('Network error');
        }
    }
);
