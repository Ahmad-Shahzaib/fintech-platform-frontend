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
