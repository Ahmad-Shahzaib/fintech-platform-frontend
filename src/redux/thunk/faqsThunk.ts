import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

interface CreateFaqPayload {
  question: string;
  answer: string;
}

export const createFaq = createAsyncThunk(
  'faqs/createFaq',
  async (payload: CreateFaqPayload, { rejectWithValue }) => {
    try {
      // Ensure admin Bearer token is present (from signin flow localStorage)
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
      } catch (e) {
        // ignore localStorage read errors
      }

      if (!token) {
        return rejectWithValue('Admin Bearer token missing. Please sign in as admin before creating FAQs.');
      }

      const response = await api.post('/admin/faqs', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data?.faqs ?? response.data;
    } catch (err: any) {
      const status = err?.response?.status;
      const serverMessage = err?.response?.data?.message || err.message || '';

      // If POST is not allowed on this endpoint (405), try creating via GET
      // with query params (some APIs use GET hacks for create).
      if (status === 405 || /method.*not.*allowed/i.test(serverMessage)) {
        try {
          // Prepare fallback headers (include token if available)
          const fallbackHeaders: Record<string, string> = {};
          try {
            if (typeof window !== 'undefined') {
              const t = localStorage.getItem('authToken') || localStorage.getItem('token');
              if (t) fallbackHeaders.Authorization = `Bearer ${t}`;
            }
          } catch (e) {}

          const getResp = await api.get('/faqs', {
            params: {
              question: payload.question,
              answer: payload.answer,
            },
            headers: fallbackHeaders,
          });
          return getResp.data?.faqs ?? getResp.data;
        } catch (innerErr: any) {
          const innerMessage = innerErr?.response?.data?.message || innerErr.message || 'Failed to create FAQ (fallback)';
          return rejectWithValue(innerMessage);
        }
      }

      const message = serverMessage || 'Failed to create FAQ';
      return rejectWithValue(message);
    }
  }
);

export default createFaq;
