import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { submitPaymentProof } from '@/redux/thunk/submitPaymentThunks';

interface SubmitPaymentState {
  loading: boolean;
  success: boolean;
  data: any | null;
  error: string | null;
}

const initialState: SubmitPaymentState = {
  loading: false,
  success: false,
  data: null,
  error: null,
};

const submitPaymentSlice = createSlice({
  name: 'submitPayment',
  initialState,
  reducers: {
    resetSubmitPayment(state) {
      state.loading = false;
      state.success = false;
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(submitPaymentProof.pending, (state) => {
      state.loading = true;
      state.success = false;
      state.error = null;
    });
    builder.addCase(submitPaymentProof.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.success = true;
      state.data = action.payload;
      state.error = null;
    });
    builder.addCase(submitPaymentProof.rejected, (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = (action.payload as string) || action.error.message || 'Failed';
    });
  },
});

export const { resetSubmitPayment } = submitPaymentSlice.actions;
export default submitPaymentSlice.reducer;
