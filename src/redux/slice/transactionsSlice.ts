import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchTransactions, Transaction, TransactionsPaginationResponse } from '@/redux/thunk/transactionsThunks';

interface TransactionsState {
    items: Transaction[];
    pagination: TransactionsPaginationResponse | null;
    loading: boolean;
    error: string | null;
}

const initialState: TransactionsState = {
    items: [],
    pagination: null,
    loading: false,
    error: null,
};

const transactionsSlice = createSlice({
    name: 'transactions',
    initialState,
    reducers: {
        clearTransactions(state) {
            state.items = [];
            state.pagination = null;
            state.loading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTransactions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTransactions.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.items = Array.isArray(action.payload?.data) ? action.payload.data : [];
                state.pagination = action.payload?.pagination ?? null;
                state.error = null;
            })
            .addCase(fetchTransactions.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || action.error.message || 'Failed to load transactions';
            });
    }
});

export const { clearTransactions } = transactionsSlice.actions;
export default transactionsSlice.reducer;
