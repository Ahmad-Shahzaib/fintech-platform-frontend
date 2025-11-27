import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchCurrencies, addCurrency, updateCurrency, fetchCurrencyDetail } from '@/redux/thunk/currencyThunks';

interface CurrencyState {
    items: Array<Record<string, any>>;
    loading: boolean;
    error: string | null;
    current: Record<string, any> | null;
    detailLoading: boolean;
    detailError: string | null;
}

const initialState: CurrencyState = {
    items: [],
    loading: false,
    error: null,
    current: null,
    detailLoading: false,
    detailError: null,
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
        // handle add currency
        builder
            .addCase(addCurrency.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addCurrency.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                // if server returns created currency object, add it to the list
                if (action.payload) {
                    if (Array.isArray(state.items)) {
                        state.items = [action.payload, ...state.items];
                    } else {
                        state.items = [action.payload];
                    }
                }
                state.error = null;
            })
            .addCase(addCurrency.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || action.error.message || 'Failed to add currency';
            });
        // handle update currency
        builder
            .addCase(updateCurrency.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCurrency.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                const updated = action.payload;
                if (updated && Array.isArray(state.items)) {
                    state.items = state.items.map(item => (item.id === updated.id ? updated : item));
                }
                state.error = null;
            })
            .addCase(updateCurrency.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || action.error.message || 'Failed to update currency';
            });
        // handle fetching single currency detail
        builder
            .addCase(fetchCurrencyDetail.pending, (state) => {
                state.detailLoading = true;
                state.detailError = null;
                state.current = null;
            })
            .addCase(fetchCurrencyDetail.fulfilled, (state, action: PayloadAction<any>) => {
                state.detailLoading = false;
                state.current = action.payload ?? null;
                state.detailError = null;
            })
            .addCase(fetchCurrencyDetail.rejected, (state, action) => {
                state.detailLoading = false;
                state.detailError = (action.payload as string) || action.error.message || 'Failed to fetch currency detail';
            });
    }
});

export const { clearCurrencies } = currencySlice.actions;
export default currencySlice.reducer;
