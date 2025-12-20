import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import axios from 'axios';

export interface RepaymentsQuery {
    page?: number;
    per_page?: number;
}

export const fetchRepayments = createAsyncThunk(
    'repayments/fetchList',
    async (params: RepaymentsQuery = { page: 1, per_page: 1000 }, { rejectWithValue }) => {
        try {
            const query = new URLSearchParams();
            if (params.page) query.set('page', String(params.page));
            if (params.per_page) query.set('per_page', String(params.per_page));

            const response = await api.get(`/user/repayments?${query.toString()}`);
            return response.data;
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data?.message || err.message || 'Failed to fetch repayments';
                return rejectWithValue(message);
            }
            return rejectWithValue('Network error');
        }
    }
);
