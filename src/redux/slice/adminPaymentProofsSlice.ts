import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchAdminProofs, updateAdminPaymentStatus } from '@/redux/thunk/adminPaymentProofsThunks';

interface ProofItem {
  id: number;
  payment_id: string;
  user?: any;
  top_up_transaction_id?: string;
  amount_paid_aud?: string;
  payment_method?: any;
  bank_id?: number;
  reference_number?: string;
  receipt_path?: string | null;
  verification_status?: string;
  rejection_reason?: string | null;
  submitted_at?: string;
  verified_at?: string | null;
}

interface AdminPaymentProofsState {
  loading: boolean;
  data: ProofItem[];
  pagination: any | null;
  error: string | null;
}

const initialState: AdminPaymentProofsState = {
  loading: false,
  data: [],
  pagination: null,
  error: null,
};

const adminPaymentProofsSlice = createSlice({
  name: 'adminPaymentProofs',
  initialState,
  reducers: {
    resetAdminPaymentProofs(state) {
      state.loading = false;
      state.data = [];
      state.pagination = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAdminProofs.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAdminProofs.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      // Support multiple API shapes:
      // 1) { data: { current_page, data: [...] , ... } }  <-- nested "data"
      // 2) { data: [...], pagination: {...} }           <-- flat shape
      const resp = action.payload;
      if (resp?.data?.data) {
        // nested: resp.data is pagination object and resp.data.data is items array
        state.data = resp.data.data || [];
        state.pagination = resp.data || null;
      } else {
        // flat or unexpected
        state.data = resp?.data || [];
        state.pagination = resp?.pagination || null;
      }
      state.error = null;
    });
    builder.addCase(fetchAdminProofs.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || action.error.message || 'Failed to fetch admin proofs';
    });
    // update status
    builder.addCase(updateAdminPaymentStatus.pending, (state) => {
      // optional: could set a flag per-item; keep it simple and set loading
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateAdminPaymentStatus.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      // API returns { message, data: { id, verification_status, ... } }
      const updated = action.payload?.data;
      if (updated && updated.id) {
        const idx = state.data.findIndex((d) => d.id === updated.id);
        if (idx !== -1) {
          state.data[idx] = { ...state.data[idx], ...updated };
        }
      }
      state.error = null;
    });
    builder.addCase(updateAdminPaymentStatus.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || action.error.message || 'Failed to update payment status';
    });
  },
});

export const { resetAdminPaymentProofs } = adminPaymentProofsSlice.actions;
export default adminPaymentProofsSlice.reducer;
