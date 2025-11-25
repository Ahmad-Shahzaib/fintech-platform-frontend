import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../lib/axios';

export const fetchUserDetail = createAsyncThunk(
    'userDetail/fetch',
    async (userId: number, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/admin/users/${userId}`);
            // API shape can be { data: { ... } } or { data: { data: {...} } }
            const payload = response.data?.data ?? response.data;
            return payload;
        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.message || 'Failed to fetch user detail';
            return rejectWithValue(msg);
        }
    }
);
