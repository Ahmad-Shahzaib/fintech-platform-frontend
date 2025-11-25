import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchKycStatus, type KycStatusResponse, type KycStatusData } from '../thunk/kycStatusThunks';

interface KycStatusState {
    data: KycStatusData | null;
    loading: boolean;
    error: string | null;
}

const initialState: KycStatusState = {
    data: null,
    loading: false,
    error: null,
};

const kycStatusSlice = createSlice({
    name: 'kycStatus',
    initialState,
    reducers: {
        resetKycStatus: (state) => {
            state.data = null;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchKycStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchKycStatus.fulfilled, (state, action: PayloadAction<KycStatusResponse>) => {
                state.loading = false;
                state.data = action.payload.data || null;
            })
            .addCase(fetchKycStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || 'Failed to fetch KYC status';
            });
    },
});

export const { resetKycStatus } = kycStatusSlice.actions;
export default kycStatusSlice.reducer;
