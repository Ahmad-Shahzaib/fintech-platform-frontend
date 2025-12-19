import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import axios from 'axios';

export interface UsersQueryParams {
    page?: number;
    per_page?: number;
    status?: string;
    kyc_status?: string;
    search?: string;
}

export interface UserKYCVerification {
    id: number;
    user_id: number;
    status: 'pending' | 'approved' | 'rejected' | 'under_review';
    [key: string]: any;
}

export interface UserResponse {
    id: number;
    role_id: number;
    name: string;
    email: string;
    email_verified_at?: string | null;
    phone?: string;
    profile_image?: string | null;
    transaction_limit: string;
    total_borrowed: string;
    total_repaid: string;
    completed_transactions: number;
    google_id?: string | null;
    apple_id?: string | null;
    status: 'active' | 'suspended' | 'inactive';
    suspension_reason?: string | null;
    suspended_at?: string | null;
    two_factor_enabled: boolean;
    last_login_at?: string | null;
    last_login_ip?: string | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    kyc_verification?: UserKYCVerification | null;
}

export interface UsersPaginationResponse {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
}

export interface UsersApiResponse {
    data: UserResponse[];
    pagination: UsersPaginationResponse;
}

export const fetchAllUsers = createAsyncThunk(
    'users/fetchAll',
    async (params: UsersQueryParams = { page: 1 }, { rejectWithValue }) => {
        try {
            const query = new URLSearchParams();
            if (params.page) query.set('page', String(params.page));
            if (params.per_page) query.set('per_page', String(params.per_page));
            if (params.status) query.set('status', params.status);
            if (params.kyc_status) query.set('kyc_status', params.kyc_status);
            if (params.search) query.set('search', params.search);

            const response = await api.get<UsersApiResponse>(`/admin/reports/users?${query.toString()}`);
            const payload = response.data ?? { data: [], pagination: null };
            return payload;
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data?.message || err.message || 'Failed to fetch users';
                return rejectWithValue(message);
            }
            return rejectWithValue('Network error');
        }
    }
);

export const exportUsersToExcel = createAsyncThunk(
    'users/export',
    async (params: UsersQueryParams = {}, { rejectWithValue }) => {
        try {
            const query = new URLSearchParams();
            if (params.status) query.set('status', params.status);
            if (params.kyc_status) query.set('kyc_status', params.kyc_status);
            if (params.search) query.set('search', params.search);

            const response = await api.get(
                `/admin/reports/export/users?${query.toString()}`,
                { responseType: 'blob' }
            );
            return response.data;
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data?.message || err.message || 'Failed to export users';
                return rejectWithValue(message);
            }
            return rejectWithValue('Network error');
        }
    }
);
