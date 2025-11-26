import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchCurrencies } from '@/redux/thunk/currencyThunks';

interface CurrencyState {
    items: Array<Record<string, any>>;
    loading: boolean;
    error: string | null;
}

const initialState: CurrencyState = {
    items: [],
    loading: false,
    error: null,
};

const currencySlice = createSlice({
    name: 'currencies',
    initialState,
    reducers: {
        clearCurrencies(state) {
            state.items = [];
            state.loading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCurrencies.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCurrencies.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.items = Array.isArray(action.payload) ? action.payload : [];
                state.error = null;
            })
            .addCase(fetchCurrencies.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || action.error.message || 'Failed to load currencies';
            });
    }
});

export const { clearCurrencies } = currencySlice.actions;
export default currencySlice.reducer;
