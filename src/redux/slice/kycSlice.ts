// src/features/kyc/kycSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { submitKyc, type KycSubmissionResponse } from '../thunk/kycThunks';

interface KycState {
    submission: KycSubmissionResponse | null;
    loading: boolean;
    error: string | null;
}

const initialState: KycState = {
    submission: null,
    loading: false,
    error: null,
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
    },
});

export const { resetKycState } = kycSlice.actions;
export default kycSlice.reducer;