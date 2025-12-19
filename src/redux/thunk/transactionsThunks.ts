import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import axios from 'axios';

export interface TransactionQueryParams {
    status?: string;
    page?: number;
    from_date?: string;
    to_date?: string;
}

export interface TransactionUser {
    id: number;
    name: string;
    email: string;
    phone?: string;
    status: string;
}

export interface TransactionCurrency {
    id: number;
    code: string;
    name: string;
    symbol: string;
    decimals: number;
}

export interface TransactionNetwork {
    id: number;
    code: string;
    name: string;
    full_name: string;
    chain_id: string;
}

export interface Transaction {
    id: number;
    transaction_id: string;
    user_id: number;
    currency_id: number;
    network_id: number;
    amount_aud: string;
    wallet_address: string;
    crypto_amount?: string | null;
    exchange_rate?: string | null;
    platform_fee_aud: string;
    network_fee_aud: string;
    total_aud: string;
    status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed' | 'cancelled';
    transaction_hash?: string | null;
    explorer_url?: string | null;
    actual_crypto_sent?: string | null;
    admin_notes?: string | null;
    approved_by?: number | null;
    processed_by?: number | null;
    rejection_reason?: string | null;
    address_validated: boolean;
    checksum_validated: boolean;
    risk_flags?: string | null;
    user_ip_address?: string;
    repayment_due_date?: string;
    repayment_amount_aud?: string;
    repayment_status?: string;
    approved_at?: string;
    processing_started_at?: string;
    completed_at?: string;
    failed_at?: string | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    user?: TransactionUser;
    currency?: TransactionCurrency;
    network?: TransactionNetwork;
}

export interface TransactionsPaginationResponse {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
}

export interface TransactionsApiResponse {
    data: Transaction[];
    pagination: TransactionsPaginationResponse;
}

export const fetchTransactions = createAsyncThunk(
    'transactions/fetchList',
    async (params: TransactionQueryParams = { page: 1 }, { rejectWithValue }) => {
        try {
            const query = new URLSearchParams();
            if (params.status) query.set('status', params.status);
            if (params.page) query.set('page', String(params.page));
            if (params.from_date) query.set('from_date', params.from_date);
            if (params.to_date) query.set('to_date', params.to_date);

            const response = await api.get<TransactionsApiResponse>(`/admin/reports/transactions?${query.toString()}`);
            const payload = response.data ?? { data: [], pagination: null };
            return payload;
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data?.message || err.message || 'Failed to fetch transactions';
                return rejectWithValue(message);
            }
            return rejectWithValue('Network error');
        }
    }
);

export const exportTransactionsToExcel = createAsyncThunk(
    'transactions/export',
    async (params: TransactionQueryParams = {}, { rejectWithValue }) => {
        try {
            const query = new URLSearchParams();
            if (params.status) query.set('status', params.status);
            if (params.from_date) query.set('from_date', params.from_date);
            if (params.to_date) query.set('to_date', params.to_date);

            const response = await api.get(
                `/admin/reports/export/payments?${query.toString()}`,
                { responseType: 'blob' }
            );
            return response.data;
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data?.message || err.message || 'Failed to export transactions';
                return rejectWithValue(message);
            }
            return rejectWithValue('Network error');
        }
    }
);
