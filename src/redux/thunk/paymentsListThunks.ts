import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import axios from 'axios';

export interface PaymentsQueryParams {
    page?: number;
    per_page?: number;
    status?: string;
    verification_status?: string;
    search?: string;
}

export interface PaymentUser {
    id: number;
    name: string;
    email: string;
    phone?: string;
    status: string;
}

export interface TopUpRequest {
    id: number;
    transaction_id: string;
    user_id: number;
    currency_id: number;
    network_id: number;
    amount_aud: string;
    wallet_address: string;
    total_aud: string;
    status: string;
    repayment_due_date: string;
    repayment_amount_aud: string;
    repayment_status: string;
    [key: string]: any;
}

export interface Payment {
    id: number;
    payment_id: string;
    user_id: number;
    top_up_request_id: number;
    amount_paid_aud: string;
    payment_method: number;
    receipt_path?: string;
    reference_number?: string;
    payment_notes?: string;
    bank_id?: number;
    verification_status: 'pending' | 'verified' | 'rejected';
    verified_by?: number;
    admin_notes?: string;
    rejection_reason?: string;
    payment_date: string;
    submitted_at: string;
    verified_at?: string;
    rejected_at?: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    user?: PaymentUser;
    top_up_request?: TopUpRequest;
}

export interface PaymentsPaginationResponse {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
}

export interface PaymentsApiResponse {
    data: Payment[];
    pagination: PaymentsPaginationResponse;
}

export const fetchPayments = createAsyncThunk(
    'payments/fetchList',
    async (params: PaymentsQueryParams = { page: 1 }, { rejectWithValue }) => {
        try {
            const query = new URLSearchParams();
            if (params.page) query.set('page', String(params.page));
            if (params.per_page) query.set('per_page', String(params.per_page));
            if (params.status) query.set('status', params.status);
            if (params.verification_status) query.set('verification_status', params.verification_status);
            if (params.search) query.set('search', params.search);

            const response = await api.get<PaymentsApiResponse>(`/admin/reports/payments?${query.toString()}`);
            const payload = response.data ?? { data: [], pagination: null };
            return payload;
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data?.message || err.message || 'Failed to fetch payments';
                return rejectWithValue(message);
            }
            return rejectWithValue('Network error');
        }
    }
);

export const exportPaymentsToExcel = createAsyncThunk(
    'payments/export',
    async (params: PaymentsQueryParams = {}, { rejectWithValue }) => {
        try {
            const query = new URLSearchParams();
            if (params.status) query.set('status', params.status);
            if (params.verification_status) query.set('verification_status', params.verification_status);
            if (params.search) query.set('search', params.search);

            const response = await api.get(
                `/admin/reports/export/payments?${query.toString()}`,
                { responseType: 'blob' }
            );
            return response.data;
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data?.message || err.message || 'Failed to export payments';
                return rejectWithValue(message);
            }
            return rejectWithValue('Network error');
        }
    }
);
