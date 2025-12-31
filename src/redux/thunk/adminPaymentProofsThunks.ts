import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import axios from 'axios';

export interface AdminPaymentProofsQuery {
  page?: number;
  status?: string;
  payment_status?: string;
}


export const fetchAdminProofs = createAsyncThunk(
  'adminPaymentProofs/fetchAll',
  async (params: AdminPaymentProofsQuery = { page: 1 }, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set('page', String(params.page));
      if (params.status) query.set('status', String(params.status));
      if (params.payment_status) query.set('payment_status', String(params.payment_status));

      const response = await api.get(`/admin/payments/all?${query.toString()}`);
      return response.data;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || err.message || 'Failed to fetch admin proofs';
        return rejectWithValue(message);
      }
      return rejectWithValue('Network error');
    }
  }
);

export default fetchAdminProofs;

// Update payment proof status (PATCH /admin/payments/:id/update-status)
export const updateAdminPaymentStatus = createAsyncThunk(
  'adminPaymentProofs/updateStatus',
  async (
    params: { id: number; verification_status: string; admin_notes?: string | null; rejection_reason?: string | null },
    { rejectWithValue }
  ) => {
    try {
      const { id, ...body } = params;
      const response = await api.post(`/admin/payments/${id}/update-status`, body);
      return response.data;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || err.message || 'Failed to update payment status';
        return rejectWithValue(message);
      }
      return rejectWithValue('Network error');
    }
  }
);

// Verify payment using top-up id (POST /admin/payments/:topupId/verify)
export const verifyAdminPayment = createAsyncThunk(
  'adminPaymentProofs/verify',
  async (params: { id: number; admin_notes?: string | null }, { rejectWithValue }) => {
    try {
      const { id, admin_notes } = params;
      const body = { admin_notes: admin_notes ?? null };
      const response = await api.post(`/admin/payments/${id}/verify`, body);
      return response.data;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || err.message || 'Failed to verify payment';
        return rejectWithValue(message);
      }
      return rejectWithValue('Network error');
    }
  }
);

// Reject payment (POST /admin/payments/:id/reject)
export const rejectAdminPayment = createAsyncThunk(
  'adminPaymentProofs/reject',
  async (params: { id: number; rejection_reason: string }, { rejectWithValue }) => {
    try {
      const { id, ...body } = params;
      const response = await api.post(`/admin/payments/${id}/reject`, body);
      return response.data;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || err.message || 'Failed to reject payment';
        return rejectWithValue(message);
      }
      return rejectWithValue('Network error');
    }
  }
);
   