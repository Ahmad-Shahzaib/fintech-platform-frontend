import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import axios from 'axios';

export const fetchOutstandingBalance = createAsyncThunk(
    'outstandingBalance/fetch',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/user/outstanding-balance');
            return response.data;
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data?.message || err.message || 'Failed to fetch outstanding balance';
                return rejectWithValue(message);
            }
            return rejectWithValue('Network error');
        }
    }
);
