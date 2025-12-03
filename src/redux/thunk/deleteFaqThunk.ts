import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

export const deleteFaq = createAsyncThunk(
  'faqs/deleteFaq',
  async (id: string, { rejectWithValue }) => {
    try {
      let token: string | null = null;
      try {
        if (typeof window !== 'undefined') {
          const tokenKeys = ['access_token', 'auth_token', 'authToken', 'token'];
          for (const k of tokenKeys) {
            const t = localStorage.getItem(k);
            if (t) {
              token = t;
              break;
            }
          }
        }
      } catch (e) {}

      if (!token) {
        return rejectWithValue('Admin Bearer token missing. Please sign in as admin before deleting FAQs.');
      }

      await api.delete(`/admin/faqs/destroy/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return id;
    } catch (err: any) {
      const serverMessage = err?.response?.data?.message || err.message || '';
      const message = serverMessage || 'Failed to delete FAQ';
      return rejectWithValue(message);
    }
  }
);

export default deleteFaq;
