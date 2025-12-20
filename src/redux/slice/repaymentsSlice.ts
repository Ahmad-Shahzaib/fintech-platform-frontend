import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchRepayments, RepaymentItem } from '@/redux/thunk/repaymentsThunks';

interface Pagination {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
}

interface RepaymentsState {
    items: RepaymentItem[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
}

const initialState: RepaymentsState = {
    items: [],
    pagination: null,
    loading: false,
    error: null,
};

const repaymentsSlice = createSlice({
    name: 'repayments',
    initialState,
    reducers: {
        clearRepayments(state) {
            state.items = [];
            state.pagination = null;
            state.loading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRepayments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRepayments.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.items = Array.isArray(action.payload?.data) ? action.payload.data : [];
                state.pagination = action.payload?.pagination ?? null;
                state.error = null;
            })
            .addCase(fetchRepayments.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || action.error.message || 'Failed to load repayments';
            });
    }
});

export const { clearRepayments } = repaymentsSlice.actions;
export default repaymentsSlice.reducer;
