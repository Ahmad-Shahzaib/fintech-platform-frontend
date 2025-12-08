import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from '@/lib/axios';

export const deleteBankDetail = createAsyncThunk(
  'bankDetails/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      const { data } = await axios.delete(`/bank-details/destroy/${id}`);
      return { id, data };
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Failed to delete bank detail';
      return rejectWithValue(message);
    }
  }
);

export default deleteBankDetail;
