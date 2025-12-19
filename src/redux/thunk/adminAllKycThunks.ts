import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../rootReducer';
import api from '../../lib/axios';

export interface AdminAllKycItem {
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
    document_front_url?: string;
    document_back_url?: string;
    selfie_url?: string;
}

export interface AdminAllKycResponse {
    data: AdminAllKycItem[];
    pagination: {
        total: number;
        current_page: number;
        last_page: number;
    };
}

export const fetchAdminAllKyc = createAsyncThunk<
    AdminAllKycResponse,
    { page?: number } | undefined,
    { state: RootState }
>('adminAllKyc/fetchAll', async (params, { rejectWithValue }) => {
    try {
        const page = params?.page ?? 1;
        const response = await api.get('/admin/kyc/all', { params: { page } });
        const data: AdminAllKycResponse = response.data;
        return data;
    } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err: any = error;
        if (err?.response && err.response.data) {
            return rejectWithValue(err.response.data.message || JSON.stringify(err.response.data));
        }
        if (err instanceof Error) return rejectWithValue(err.message);
        return rejectWithValue('Failed to fetch all KYC records');
    }
});

export const approveAdminAllKyc = createAsyncThunk<
    any,
    number,
    { state: RootState }
>('adminAllKyc/approve', async (kycId, { rejectWithValue }) => {
    try {
        console.log('Approving KYC ID:', kycId);
        const response = await api.post(`/admin/kyc/${kycId}/approve`);
        console.log('Approve response:', response.data);
        return response.data;
    } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err: any = error;
        console.error('Approve error:', err);
        if (err?.response && err.response.data) {
            return rejectWithValue(err.response.data.message || JSON.stringify(err.response.data));
        }
        if (err instanceof Error) return rejectWithValue(err.message);
        return rejectWithValue('Failed to approve KYC');
    }
});

export const rejectAdminAllKyc = createAsyncThunk<
    any,
    { id: number; rejection_reason?: string },
    { state: RootState }
>('adminAllKyc/reject', async (payload, { rejectWithValue }) => {
    try {
        const { id, rejection_reason } = payload;
        console.log('Rejecting KYC ID:', id, 'Reason:', rejection_reason);
        const response = await api.post(`/admin/kyc/${id}/reject`, { rejection_reason });
        console.log('Reject response:', response.data);
        return response.data;
    } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err: any = error;
        console.error('Reject error:', err);
        if (err?.response && err.response.data) {
            return rejectWithValue(err.response.data.message || JSON.stringify(err.response.data));
        }
        if (err instanceof Error) return rejectWithValue(err.message);
        return rejectWithValue('Failed to reject KYC');
    }
});



export default {};
