import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchTopUpDetail } from '../thunk/adminTopUpDetailThunks';

// Define the types for the top-up detail response
interface User {
    id: number;
    role_id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    phone: string;
    transaction_limit: string;
    total_borrowed: string;
    total_repaid: string;
    completed_transactions: number;
    google_id: string | null;
    apple_id: string | null;
    status: string;
    suspension_reason: string | null;
    suspended_at: string | null;
    two_factor_enabled: boolean;
    last_login_at: string | null;
    last_login_ip: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

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
    chain_id: string | null;
    rpc_url: string | null;
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

interface Approver {
    id: number;
    role_id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    phone: string;
    transaction_limit: string;
    total_borrowed: string;
    total_repaid: string;
    completed_transactions: number;
    google_id: string | null;
    apple_id: string | null;
    status: string;
    suspension_reason: string | null;
    suspended_at: string | null;
    two_factor_enabled: boolean;
    last_login_at: string | null;
    last_login_ip: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

interface Processor {
    id: number;
    role_id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    phone: string;
    transaction_limit: string;
    total_borrowed: string;
    total_repaid: string;
    completed_transactions: number;
    google_id: string | null;
    apple_id: string | null;
    status: string;
    suspension_reason: string | null;
    suspended_at: string | null;
    two_factor_enabled: boolean;
    last_login_at: string | null;
    last_login_ip: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

interface TopUpDetail {
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
    user: User;
    currency: Currency;
    network: Network;
    approver: Approver | null;
    processor: Processor | null;
}

interface AdminTopUpDetailState {
    data: TopUpDetail | null;
    loading: boolean;
    error: string | null;
}

const initialState: AdminTopUpDetailState = {
    data: null,
    loading: false,
    error: null,
};

const adminTopUpDetailSlice = createSlice({
    name: 'adminTopUpDetail',
    initialState,
    reducers: {
        clearAdminTopUpDetailState(state) {
            state.data = null;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTopUpDetail.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTopUpDetail.fulfilled, (state, action: PayloadAction<TopUpDetail>) => {
                state.loading = false;
                state.data = action.payload;
                state.error = null;
            })
            .addCase(fetchTopUpDetail.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Failed to fetch top-up details';
            });
    },
});

export const { clearAdminTopUpDetailState } = adminTopUpDetailSlice.actions;
export default adminTopUpDetailSlice.reducer;