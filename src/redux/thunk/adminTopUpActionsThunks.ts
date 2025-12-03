import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import axios from 'axios';

export const approveTopUp = createAsyncThunk(
    'adminTopUps/approve',
    async (topUpId: number, { rejectWithValue }) => {
        try {
            const response = await api.post(`/admin/topup/${topUpId}/approve`);
            return { id: topUpId, message: response.data.message };
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data?.message || err.message || 'Failed to approve top-up';
                return rejectWithValue(message);
            }
            return rejectWithValue('Network error');
        }
    }
);

export const rejectTopUp = createAsyncThunk(
    'adminTopUps/reject',
    async ({ topUpId, reason }: { topUpId: number; reason?: string }, { rejectWithValue }) => {
        try {
            // Backend expects `rejection_reason` as the field name
            const response = await api.post(`/admin/topup/${topUpId}/reject`, { rejection_reason: reason });
            return { id: topUpId, message: response.data.message };
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data?.message || err.message || 'Failed to reject top-up';
                return rejectWithValue(message);
            }
            return rejectWithValue('Network error');
        }
    }
);

export const completeTopUp = createAsyncThunk(
    'adminTopUps/complete',
    async (
        {
            topUpId,
            transaction_hash,
            actual_crypto_sent,
            admin_notes,
        }: { topUpId: number; transaction_hash: string; actual_crypto_sent: number; admin_notes?: string },
        { rejectWithValue }
    ) => {
        try {
            const payload = { transaction_hash, actual_crypto_sent, admin_notes };
            const response = await api.post(`/admin/topup/${topUpId}/complete`, payload);
            return { id: topUpId, message: response.data.message };
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data?.message || err.message || 'Failed to complete top-up';
                return rejectWithValue(message);
            }
            return rejectWithValue('Network error');
        }
    }
);

export const processTopUp = createAsyncThunk(
    'adminTopUps/process',
    async (
        { topUpId, admin_notes }: { topUpId: number; admin_notes?: string },
        { rejectWithValue }
    ) => {
        try {
            const payload = { admin_notes };
            const response = await api.post(`/admin/topup/${topUpId}/process`, payload);
            return { id: topUpId, message: response.data.message };
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data?.message || err.message || 'Failed to start processing top-up';
                return rejectWithValue(message);
            }
            return rejectWithValue('Network error');
        }
    }
);