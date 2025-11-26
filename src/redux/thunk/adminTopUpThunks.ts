import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import axios from 'axios';

export interface AdminTopUpQuery {
    page?: number;
}

export const fetchPendingTopUps = createAsyncThunk(
    'adminTopUps/fetchPending',
    async (params: AdminTopUpQuery = { page: 1 }, { rejectWithValue }) => {
        try {
            const query = new URLSearchParams();
            if (params.page) query.set('page', String(params.page));

            const response = await api.get(`/admin/topup/pending?${query.toString()}`);
            // Expecting { data: [...], pagination: {...} }
            const payload = response.data ?? {};
            return payload;
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data?.message || err.message || 'Failed to fetch pending top-ups';
                return rejectWithValue(message);
            }
            return rejectWithValue('Network error');
        }
    }
);