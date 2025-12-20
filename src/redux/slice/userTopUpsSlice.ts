import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchUserTopUps } from '@/redux/thunk/userTopUpsThunks';

interface Currency {
    id: number;
    code: string;
    name: string;
    symbol: string;
    description: string;
    icon_url: string | null;
    is_active: boolean;
    decimals: number;
    min_amount: string;
    max_amount: string | null;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

interface Network {
    id: number;
    code: string;
    name: string;
    full_name: string;
    description: string;
    icon_url: string | null;
    chain_id: string;
    rpc_url: string;
    explorer_url: string;
    address_format: string;
    avg_transaction_fee_aud: string;
    avg_confirmation_time_minutes: string;
    is_active: boolean;
    requires_checksum: boolean;
    confirmations_required: number;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

interface UserTopUpItem {
    id: number;
    transaction_id: string;
    user_id: number;
    currency_id: number;
    network_id: number;
    amount_aud: string;
    wallet_address: string;
    wallet_address_confirmation: string;
    crypto_amount: string | null;
    exchange_rate: string | null;
    platform_fee_aud: string;
    network_fee_aud: string;
    total_aud: string;
    status: string;
    transaction_hash: string | null;
    explorer_url: string | null;
    actual_crypto_sent: string | null;
    admin_notes: string | null;
    approved_by: number | null;
    processed_by: number | null;
    rejection_reason: string | null;
    address_validated: boolean;
    checksum_validated: boolean;
    risk_flags: string | null;
    user_ip_address: string;
    repayment_due_date: string;
    repayment_amount_aud: string;
    repayment_status: string;
    approved_at: string | null;
    processing_started_at: string | null;
    completed_at: string | null;
    failed_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    currency: Currency;
    network: Network;
}

interface Pagination {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
}

interface UserTopUpsState {
    items: UserTopUpItem[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
}

const initialState: UserTopUpsState = {
    items: [],
    pagination: null,
    loading: false,
    error: null,
};

const userTopUpsSlice = createSlice({
    name: 'userTopUps',
    initialState,
    reducers: {
        clearUserTopUps(state) {
            state.items = [];
            state.pagination = null;
            state.loading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserTopUps.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserTopUps.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                // Handle response structure - data can be direct array or nested in response.data
                const items = action.payload?.data || action.payload || [];
                state.items = Array.isArray(items) ? items : [];
                state.pagination = action.payload?.pagination ?? null;
                state.error = null;
                console.log('User Top Ups Loaded:', state.items.length, 'items');
            })
            .addCase(fetchUserTopUps.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || action.error.message || 'Failed to load user top-ups';
                console.error('User Top Ups Error:', state.error);
            });
    }
});

export const { clearUserTopUps } = userTopUpsSlice.actions;
export default userTopUpsSlice.reducer;
