import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

export const fetchFaqs = createAsyncThunk('faqs/fetchFaqs', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/faqs');
    return response.data;
  } catch (err: any) {
    const message = err?.response?.data?.message || err.message || 'Failed to fetch FAQs';
    return rejectWithValue(message);
  }
});

export default fetchFaqs;
