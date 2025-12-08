import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchPaymentMethods } from '@/redux/thunk/paymentMethodsThunks';

interface PaymentMethod {
  id: number;
  name: string;
  is_active: number;
  created_at?: string;
  updated_at?: string;
}

interface PaymentMethodsState {
  loading: boolean;
  methods: PaymentMethod[];
  error: string | null;
}

const initialState: PaymentMethodsState = {
  loading: false,
  methods: [],
  error: null,
};

const paymentMethodsSlice = createSlice({
  name: 'paymentMethods',
  initialState,
  reducers: {
    resetPaymentMethods(state) {
      state.loading = false;
      state.methods = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchPaymentMethods.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPaymentMethods.fulfilled, (state, action: PayloadAction<PaymentMethod[]>) => {
      state.loading = false;
      state.methods = action.payload || [];
      state.error = null;
    });
    builder.addCase(fetchPaymentMethods.rejected, (state, action) => {
      state.loading = false;
      state.methods = [];
      state.error = (action.payload as string) || action.error.message || 'Failed to load payment methods';
    });
  },
});

export const { resetPaymentMethods } = paymentMethodsSlice.actions;
export default paymentMethodsSlice.reducer;
