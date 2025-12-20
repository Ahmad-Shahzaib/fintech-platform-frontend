import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import axios from 'axios';

export interface UserTopUpsQuery {
    page?: number;
    per_page?: number;
}

export const fetchUserTopUps = createAsyncThunk(
    'userTopUps/fetchList',
    async (params: UserTopUpsQuery = { page: 1, per_page: 1000 }, { rejectWithValue }) => {
        try {
            const query = new URLSearchParams();
            if (params.page) query.set('page', String(params.page));
            if (params.per_page) query.set('per_page', String(params.per_page));

            const response = await api.get(`/user/topups?${query.toString()}`);
            return response.data;
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data?.message || err.message || 'Failed to fetch user top-ups';
                return rejectWithValue(message);
            }
            return rejectWithValue('Network error');
        }
    }
);
