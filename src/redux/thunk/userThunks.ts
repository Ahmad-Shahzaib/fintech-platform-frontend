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

export const blockUser = createAsyncThunk(
    'userDetail/block',
    async ({ userId, reason }: { userId: number; reason?: string }, { rejectWithValue }) => {
        try {
            // Use POST to the block endpoint with optional reason
            const response = await axios.post(`/admin/users/${userId}/block`, { reason });
            const payload = response.data?.data ?? response.data;
            return payload;
        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.message || 'Failed to block user';
            return rejectWithValue(msg);
        }
    }
);

export const unblockUser = createAsyncThunk(
    'userDetail/unblock',
    async (userId: number, { rejectWithValue }) => {
        try {
            const response = await axios.post(`/admin/users/${userId}/unblock`);
            const payload = response.data?.data ?? response.data;
            return payload;
        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.message || 'Failed to unblock user';
            return rejectWithValue(msg);
        }
    }
);

export const updateUser = createAsyncThunk(
    'userDetail/update',
    async ({ userId, data }: { userId: number; data: Record<string, any> }, { rejectWithValue }) => {
        try {
            const response = await axios.patch(`/admin/users/${userId}`, data);
            const payload = response.data?.data ?? response.data;
            return payload;
        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.message || 'Failed to update user';
            return rejectWithValue(msg);
        }
    }
);

export const updateUserLimit = createAsyncThunk(
    'userDetail/updateLimit',
    async ({ userId, transaction_limit }: { userId: number; transaction_limit: number }, { rejectWithValue }) => {
        try {
            // Endpoint to update user's transaction limit
            const response = await axios.put(`/admin/users/${userId}/limit`, { transaction_limit });
            const payload = response.data?.data ?? response.data;
            return payload;
        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.message || 'Failed to update transaction limit';
            return rejectWithValue(msg);
        }
    }
);
