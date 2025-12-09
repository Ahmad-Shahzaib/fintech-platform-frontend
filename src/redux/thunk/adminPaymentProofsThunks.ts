import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import axios from 'axios';

export interface AdminPaymentProofsQuery {
  page?: number;
  status?: string;
}

// Fetch all payment proofs for admin (GET /admin/all-proofs)
export const fetchAdminProofs = createAsyncThunk(
  'adminPaymentProofs/fetchAll',
  async (params: AdminPaymentProofsQuery = { page: 1 }, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set('page', String(params.page));
      if (params.status) query.set('status', String(params.status));

      const response = await api.get(`/admin/all-proofs?${query.toString()}`);
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
