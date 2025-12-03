import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import axios from 'axios';

// Expecting a FormData instance with these fields:
// top_up_request_id, amount_paid_aud, payment_method, reference_number, payment_notes, receipt_file
export const submitPaymentProof = createAsyncThunk(
  'payments/submitProof',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await api.post('/payments/submit-proof', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || err.message || 'Failed to submit payment proof';
        return rejectWithValue(message);
      }
      return rejectWithValue('Network error');
    }
  }
);

export default submitPaymentProof;
