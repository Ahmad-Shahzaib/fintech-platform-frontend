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




export default {};
