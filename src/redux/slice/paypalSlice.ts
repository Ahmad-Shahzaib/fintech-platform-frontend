import { createSlice } from '@reduxjs/toolkit';
import { fetchPaypalDetails } from './fetchPaypalDetailsThunk';
import { updatePaypalDetail } from './updatePaypalDetailThunk';
import { deleteBankDetail } from './deleteBankDetailThunk';

export interface PaypalDetail {
  id?: number;
  payment_method_id?: number;
  paypal_email: string;
  account_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaypalDetailsState {
  loading: boolean;
  error?: string | null;
  items: PaypalDetail[];
}

const initialState: PaypalDetailsState = {
  loading: false,
  error: null,
  items: [],
};

const paypalSlice = createSlice({
  name: 'paypalDetails',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPaypalDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaypalDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload as PaypalDetail[];
        state.error = null;
      })
      .addCase(fetchPaypalDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch PayPal details';
      })

      // paypal-specific update
      .addCase(updatePaypalDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePaypalDetail.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload?.data || action.payload;
        if (updated && updated.id) {
          state.items = state.items.map((it) => (it.id === updated.id ? { ...it, ...updated } : it));
        }
        state.error = null;
      })
      .addCase(updatePaypalDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to update PayPal detail';
      })

      .addCase(deleteBankDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBankDetail.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload?.id;
        if (typeof id === 'number') {
          state.items = state.items.filter((it) => it.id !== id);
        }
        state.error = null;
      })
      .addCase(deleteBankDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to delete PayPal detail';
      });
  },
});

export default paypalSlice.reducer;
