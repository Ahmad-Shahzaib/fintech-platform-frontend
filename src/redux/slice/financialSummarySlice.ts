import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchFinancialSummary, FinancialSummaryData } from '@/redux/thunk/financialSummaryThunks';

interface FinancialSummaryState {
    data: FinancialSummaryData | null;
    loading: boolean;
    error: string | null;
}

const initialState: FinancialSummaryState = {
    data: null,
    loading: false,
    error: null,
};

const financialSummarySlice = createSlice({
    name: 'financialSummary',
    initialState,
    reducers: {
        clearFinancialSummary(state) {
            state.data = null;
            state.loading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchFinancialSummary.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFinancialSummary.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.data = action.payload;
                state.error = null;
            })
            .addCase(fetchFinancialSummary.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || action.error.message || 'Failed to load financial summary';
            });
    }
});

export const { clearFinancialSummary } = financialSummarySlice.actions;
export default financialSummarySlice.reducer;
