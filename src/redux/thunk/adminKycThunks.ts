import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../rootReducer';
import api from '../../lib/axios';

export interface AdminPendingKycItem {
    id: number;
    user: {
        id: number;
        name: string;
        email: string;
    };
    full_name: string;
    document_type: string;
    status: string;
    submitted_at: string;
}

export interface AdminPendingKycResponse {
    data: AdminPendingKycItem[];
    pagination: {
        total: number;
        current_page: number;
        last_page: number;
    };
}

export interface AdminKycDetailResponse {
    data: any; // keep flexible for detail
}

export const fetchAdminPendingKyc = createAsyncThunk<
    AdminPendingKycResponse,
    { page?: number } | undefined,
    { state: RootState }
>('adminKyc/fetchPending', async (params, { rejectWithValue }) => {
    try {
        const page = params?.page ?? 1;
        const response = await api.get('/admin/kyc/pending', { params: { page } });
        const data: AdminPendingKycResponse = response.data;
        return data;
    } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err: any = error;
        if (err?.response && err.response.data) {
            return rejectWithValue(err.response.data.message || JSON.stringify(err.response.data));
        }
        if (err instanceof Error) return rejectWithValue(err.message);
        return rejectWithValue('Failed to fetch admin pending KYC');
    }
});

export const fetchAdminKycDetail = createAsyncThunk<
    AdminKycDetailResponse,
    number,
    { state: RootState }
>('adminKyc/fetchDetail', async (kycId, { rejectWithValue }) => {
    try {
        const response = await api.get(`/admin/kyc/${kycId}`);
        const data: AdminKycDetailResponse = response.data;
        return data;
    } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err: any = error;
        if (err?.response && err.response.data) {
            return rejectWithValue(err.response.data.message || JSON.stringify(err.response.data));
        }
        if (err instanceof Error) return rejectWithValue(err.message);
        return rejectWithValue('Failed to fetch admin KYC detail');
    }
});

export const approveAdminKyc = createAsyncThunk<
    any,
    number,
    { state: RootState }
>('adminKyc/approve', async (kycId, { rejectWithValue }) => {
    try {
        const response = await api.post(`/admin/kyc/${kycId}/approve`);
        return response.data;
    } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err: any = error;
        if (err?.response && err.response.data) {
            return rejectWithValue(err.response.data.message || JSON.stringify(err.response.data));
        }
        if (err instanceof Error) return rejectWithValue(err.message);
        return rejectWithValue('Failed to approve admin KYC');
    }
});

export const rejectAdminKyc = createAsyncThunk<
    any,
    number,
    { state: RootState }
>('adminKyc/reject', async (kycId, { rejectWithValue }) => {
    try {
        const response = await api.post(`/admin/kyc/${kycId}/reject`);
        return response.data;
    } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err: any = error;
        if (err?.response && err.response.data) {
            return rejectWithValue(err.response.data.message || JSON.stringify(err.response.data));
        }
        if (err instanceof Error) return rejectWithValue(err.message);
        return rejectWithValue('Failed to reject admin KYC');
    }
});

export default {};
