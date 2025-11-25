// src/features/kyc/kycSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    submitKyc,
    type KycSubmissionResponse,
    fetchPendingKyc,
    fetchKycDetail,
    type PendingKycItem,
    type PendingKycResponse,
    type KycDetailResponse,
} from '../thunk/kycThunks';

interface KycState {
    submission: KycSubmissionResponse | null;
    loading: boolean;
    error: string | null;
    // Pending list
    pendingList: PendingKycItem[];
    pendingLoading: boolean;
    pendingError: string | null;
    pagination: PendingKycResponse['pagination'] | null;
    // Detail
    detail: KycDetailResponse | null;
    detailLoading: boolean;
    detailError: string | null;
}

const initialState: KycState = {
    submission: null,
    loading: false,
    error: null,
    pendingList: [],
    pendingLoading: false,
    pendingError: null,
    pagination: null,
    detail: null,
    detailLoading: false,
    detailError: null,
};

const kycSlice = createSlice({
    name: 'kyc',
    initialState,
    reducers: {
        resetKycState: (state) => {
            state.submission = null;
            state.error = null;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(submitKyc.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(submitKyc.fulfilled, (state, action: PayloadAction<KycSubmissionResponse>) => {
                state.loading = false;
                state.submission = action.payload;
                state.error = null;
            })
            .addCase(submitKyc.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Pending list
        builder
            .addCase(fetchPendingKyc.pending, (state) => {
                state.pendingLoading = true;
                state.pendingError = null;
            })
            .addCase(fetchPendingKyc.fulfilled, (state, action: PayloadAction<PendingKycResponse>) => {
                state.pendingLoading = false;
                state.pendingList = action.payload.data || [];
                state.pagination = action.payload.pagination || null;
                state.pendingError = null;
            })
            .addCase(fetchPendingKyc.rejected, (state, action) => {
                state.pendingLoading = false;
                state.pendingError = action.payload as string;
            });

        // KYC detail
        builder
            .addCase(fetchKycDetail.pending, (state) => {
                state.detailLoading = true;
                state.detailError = null;
            })
            .addCase(fetchKycDetail.fulfilled, (state, action: PayloadAction<KycDetailResponse>) => {
                state.detailLoading = false;
                state.detail = action.payload;
                state.detailError = null;
            })
            .addCase(fetchKycDetail.rejected, (state, action) => {
                state.detailLoading = false;
                state.detailError = action.payload as string;
            });
    },
});

export const { resetKycState } = kycSlice.actions;
export default kycSlice.reducer;