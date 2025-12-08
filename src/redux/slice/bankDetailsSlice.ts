import { createSlice } from '@reduxjs/toolkit';
import { addBankDetail } from './bankDetailsThunk';
import { fetchBankDetails } from './fetchBankDetailsThunk';
import { updateBankDetail } from './updateBankDetailThunk';
import { deleteBankDetail } from './deleteBankDetailThunk';

export interface BankDetail {
  id?: number;
  payment_method_id?: number;
  bank_name: string;
  account_title: string;
  account_number: string;
  iban?: string | null;
  swift_code?: string | null;
  paypal_email?: string | null;
  account_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BankDetailsState {
  loading: boolean;
  error?: string | null;
  lastAdded?: any | null;
  items: BankDetail[];
}

const initialState: BankDetailsState = {
  loading: false,
  error: null,
  lastAdded: null,
  items: [],
};

const bankDetailsSlice = createSlice({
  name: 'bankDetails',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBankDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBankDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload as BankDetail[];
        state.error = null;
      })
      .addCase(fetchBankDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch bank details';
      })
      .addCase(addBankDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBankDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.lastAdded = action.payload;
        // don't mutate items blindly — server will be re-fetched by component after add
        state.error = null;
      })
      .addCase(addBankDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to add bank detail';
      });
      
      // update
      builder
      .addCase(updateBankDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBankDetail.fulfilled, (state, action) => {
        state.loading = false;
        // action.payload expected to contain updated record
        const updated = action.payload?.data || action.payload;
        if (updated && updated.id) {
          state.items = state.items.map((it) => (it.id === updated.id ? { ...it, ...updated } : it));
        }
        state.error = null;
      })
      .addCase(updateBankDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to update bank detail';
      })

      // delete
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
        state.error = (action.payload as string) || 'Failed to delete bank detail';
      });
  },
});

export default bankDetailsSlice.reducer;
