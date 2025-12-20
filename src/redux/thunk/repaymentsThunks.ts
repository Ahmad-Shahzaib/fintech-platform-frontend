import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import axios from 'axios';

export interface RepaymentsQuery {
    page?: number;
    per_page?: number;
}

export interface RepaymentItem {
    id: number;
    payment_id: string;
    user_id: number;
    top_up_request_id: number;
    amount_paid_aud: string;
    payment_method: number;
    receipt_path: string;
    reference_number: string;
    payment_notes: string;
    bank_id: number;
    verification_status: string;
    verified_by: number | null;
    admin_notes: string | null;
    rejection_reason: string | null;
    payment_date: string;
    submitted_at: string;
    verified_at: string;
    rejected_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    top_up_request: {
        id: number;
        transaction_id: string;
        user_id: number;
        currency_id: number;
        network_id: number;
        amount_aud: string;
        wallet_address: string;
        crypto_amount: string | null;
        exchange_rate: string | null;
        platform_fee_aud: string;
        network_fee_aud: string;
        total_aud: string;
        status: string;
        transaction_hash: string;
        explorer_url: string;
        actual_crypto_sent: string;
        admin_notes: string;
        approved_by: number;
        processed_by: number;
        rejection_reason: string | null;
        address_validated: boolean;
        checksum_validated: boolean;
        risk_flags: string | null;
        user_ip_address: string;
        repayment_due_date: string;
        repayment_amount_aud: string;
        repayment_status: string;
        approved_at: string;
        processing_started_at: string;
        completed_at: string;
        failed_at: string | null;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
    };
}

export const fetchRepayments = createAsyncThunk(
    'repayments/fetchList',
    async (params: RepaymentsQuery = { page: 1, per_page: 1000 }, { rejectWithValue }) => {
        try {
            const query = new URLSearchParams();
            if (params.page) query.set('page', String(params.page));
            if (params.per_page) query.set('per_page', String(params.per_page));

            const response = await api.get(`/user/repayments?${query.toString()}`);
            return response.data;
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data?.message || err.message || 'Failed to fetch repayments';
                return rejectWithValue(message);
            }
            return rejectWithValue('Network error');
        }
    }
);
