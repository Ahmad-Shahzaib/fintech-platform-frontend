import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchTopUps } from '@/redux/thunk/topUpsThunks';

interface Pagination {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
}

interface TopUpItem {
    id: number | string;
    transaction_id?: string;
    amount_aud?: string;
    total_aud?: string;
    currency?: string;
    network?: string;
    wallet_address?: string;
    status?: string;
    created_at?: string;
    transaction_hash?: string | null;
}

interface TopUpsState {
    items: TopUpItem[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
}

const initialState: TopUpsState = {
    items: [],
    pagination: null,
    loading: false,
    error: null,
};

const topUpsSlice = createSlice({
    name: 'topUps',
    initialState,
    reducers: {
        clearTopUps(state) {
            state.items = [];
            state.pagination = null;
            state.loading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTopUps.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTopUps.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.items = Array.isArray(action.payload?.data) ? action.payload.data : [];
                state.pagination = action.payload?.pagination ?? null;
                state.error = null;
            })
            .addCase(fetchTopUps.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || action.error.message || 'Failed to load top-ups';
            });
    }
});

export const { clearTopUps } = topUpsSlice.actions;
export default topUpsSlice.reducer;
