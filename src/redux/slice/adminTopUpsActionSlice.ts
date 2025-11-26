import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchPendingTopUps } from '../thunk/adminTopUpThunks';
import { approveTopUp, rejectTopUp } from '../thunk/adminTopUpActionsThunks';

interface Pagination {
    total: number;
    current_page: number;
    last_page: number;
}

interface TopUpItem {
    id: number;
    transaction_id: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
    amount_aud: string;
    currency: string;
    network: string;
    wallet_address: string;
    status: string;
    created_at: string;
}

interface AdminTopUpResponse {
    data: TopUpItem[];
    pagination: Pagination;
}

interface AdminTopUpState {
    data: AdminTopUpResponse | null;
    loading: boolean;
    error: string | null;
    actionLoading: boolean;
    actionError: string | null;
    actionSuccess: string | null;
}

const initialState: AdminTopUpState = {
    data: null,
    loading: false,
    error: null,
    actionLoading: false,
    actionError: null,
    actionSuccess: null,
};

const adminTopUpSlice = createSlice({
    name: 'adminTopUps',
    initialState,
    reducers: {
        clearAdminTopUpState(state) {
            state.data = null;
            state.loading = false;
            state.error = null;
            state.actionLoading = false;
            state.actionError = null;
            state.actionSuccess = null;
        },
        clearActionMessages(state) {
            state.actionError = null;
            state.actionSuccess = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch pending top-ups
            .addCase(fetchPendingTopUps.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPendingTopUps.fulfilled, (state, action: PayloadAction<AdminTopUpResponse>) => {
                state.loading = false;
                state.data = action.payload;
                state.error = null;
            })
            .addCase(fetchPendingTopUps.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Failed to fetch pending top-ups';
            })
            // Approve top-up
            .addCase(approveTopUp.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
                state.actionSuccess = null;
            })
            .addCase(approveTopUp.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.actionSuccess = action.payload.message;
                // Remove the approved top-up from the list
                if (state.data) {
                    state.data.data = state.data.data.filter(item => item.id !== action.payload.id);
                    state.data.pagination.total -= 1;
                }
            })
            .addCase(approveTopUp.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload as string || 'Failed to approve top-up';
            })
            // Reject top-up
            .addCase(rejectTopUp.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
                state.actionSuccess = null;
            })
            .addCase(rejectTopUp.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.actionSuccess = action.payload.message;
                // Remove the rejected top-up from the list
                if (state.data) {
                    state.data.data = state.data.data.filter(item => item.id !== action.payload.id);
                    state.data.pagination.total -= 1;
                }
            })
            .addCase(rejectTopUp.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload as string || 'Failed to reject top-up';
            });
    },
});

export const { clearAdminTopUpState, clearActionMessages } = adminTopUpSlice.actions;
export default adminTopUpSlice.reducer;