import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchPayments, Payment, PaymentsPaginationResponse } from '@/redux/thunk/paymentsListThunks';

interface PaymentsListState {
    items: Payment[];
    pagination: PaymentsPaginationResponse | null;
    loading: boolean;
    error: string | null;
}

const initialState: PaymentsListState = {
    items: [],
    pagination: null,
    loading: false,
    error: null,
};

const paymentsListSlice = createSlice({
    name: 'paymentsList',
    initialState,
    reducers: {
        clearPaymentsList(state) {
            state.items = [];
            state.pagination = null;
            state.loading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPayments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPayments.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.items = Array.isArray(action.payload?.data) ? action.payload.data : [];
                state.pagination = action.payload?.pagination ?? null;
                state.error = null;
            })
            .addCase(fetchPayments.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || action.error.message || 'Failed to load payments';
            });
    }
});

export const { clearPaymentsList } = paymentsListSlice.actions;
export default paymentsListSlice.reducer;
