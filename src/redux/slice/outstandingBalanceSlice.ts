import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchOutstandingBalance } from '@/redux/thunk/outstandingBalanceThunks';

interface OutstandingItem {
    transaction_id: string;
    amount_borrowed: number;
    amount_due: number;
    due_date: string;
    status: string;
    days_overdue: number;
}

interface OutstandingBalanceData {
    total_outstanding: number;
    formatted: string;
    items: OutstandingItem[];
}

interface OutstandingBalanceState {
    data: OutstandingBalanceData | null;
    loading: boolean;
    error: string | null;
}

const initialState: OutstandingBalanceState = {
    data: null,
    loading: false,
    error: null,
};

const outstandingBalanceSlice = createSlice({
    name: 'outstandingBalance',
    initialState,
    reducers: {
        clearOutstandingBalance(state) {
            state.data = null;
            state.loading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOutstandingBalance.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOutstandingBalance.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.data = action.payload?.data || null;
                state.error = null;
            })
            .addCase(fetchOutstandingBalance.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || action.error.message || 'Failed to load outstanding balance';
            });
    }
});

export const { clearOutstandingBalance } = outstandingBalanceSlice.actions;
export default outstandingBalanceSlice.reducer;
