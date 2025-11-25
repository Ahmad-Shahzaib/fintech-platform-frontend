import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../rootReducer';
import api from '../../lib/axios';

export interface KycStatusData {
    id: number;
    status: string;
    submitted_at: string | null;
    reviewed_at: string | null;
    rejection_reason: string | null;
}

export interface KycStatusResponse {
    data: KycStatusData;
}

export const fetchKycStatus = createAsyncThunk<
    KycStatusResponse,
    void,
    { state: RootState }
>('kyc/fetchStatus', async (_arg, { rejectWithValue }) => {
    try {
        const response = await api.get('/kyc/status');
        const data: KycStatusResponse = response.data;
        return data;
    } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err: any = error;
        if (err?.response && err.response.data) {
            return rejectWithValue(err.response.data.message || JSON.stringify(err.response.data));
        }
        if (err instanceof Error) return rejectWithValue(err.message);
        return rejectWithValue('Failed to fetch KYC status');
    }
});

export default {};
