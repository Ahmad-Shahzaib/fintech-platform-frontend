import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import axios from 'axios';

export interface AdminAllTopUpsQuery {
    status?: string;
    page?: number;
}

export const fetchAllTopUps = createAsyncThunk(
    'adminAllTopUps/fetchAll',
    async (params: AdminAllTopUpsQuery = { page: 1 }, { rejectWithValue }) => {
        try {
            const query = new URLSearchParams();
            if (params.status) query.set('status', params.status);
            if (params.page) query.set('page', String(params.page));

            const response = await api.get(`/admin/topup/all?${query.toString()}`);
            // The response structure is { data: { data: [...], pagination: {...} }, pagination: {...} }
            return response.data;
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data?.message || err.message || 'Failed to fetch all top-ups';
                return rejectWithValue(message);
            }
            return rejectWithValue('Network error');
        }
    }
);