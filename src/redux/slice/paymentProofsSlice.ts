import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchMyProofs } from '@/redux/thunk/paymentProofsThunks';

interface ProofItem {
  id: number;
  payment_id: string;
  top_up_transaction_id?: string;
  amount_paid_aud: string;
  payment_method: string;
  reference_number?: string;
  verification_status?: string;
  rejection_reason?: string | null;
  submitted_at?: string;
  verified_at?: string | null;
}

interface PaymentProofsState {
  loading: boolean;
  data: ProofItem[];
  pagination: any | null;
  error: string | null;
}

const initialState: PaymentProofsState = {
  loading: false,
  data: [],
  pagination: null,
  error: null,
};

const paymentProofsSlice = createSlice({
  name: 'paymentProofs',
  initialState,
  reducers: {
    resetPaymentProofs(state) {
      state.loading = false;
      state.data = [];
      state.pagination = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMyProofs.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMyProofs.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.data = action.payload?.data || [];
      state.pagination = action.payload?.pagination || null;
      state.error = null;
    });
    builder.addCase(fetchMyProofs.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || action.error.message || 'Failed to fetch proofs';
    });
  },
});

export const { resetPaymentProofs } = paymentProofsSlice.actions;
export default paymentProofsSlice.reducer;
