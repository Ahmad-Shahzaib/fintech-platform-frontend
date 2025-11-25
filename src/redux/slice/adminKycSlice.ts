import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    fetchAdminPendingKyc,
    fetchAdminKycDetail,
    approveAdminKyc,
    rejectAdminKyc,
    type AdminPendingKycItem,
    type AdminPendingKycResponse,
    type AdminKycDetailResponse,
} from '../thunk/adminKycThunks';

interface AdminKycState {
    pendingList: AdminPendingKycItem[];
    pendingLoading: boolean;
    pendingError: string | null;
    actionLoading: boolean;
    actionError: string | null;
    pagination: AdminPendingKycResponse['pagination'] | null;
    detail: AdminKycDetailResponse | null;
    detailLoading: boolean;
    detailError: string | null;
}

const initialState: AdminKycState = {
    pendingList: [],
    pendingLoading: false,
    pendingError: null,
    actionLoading: false,
    actionError: null,
    pagination: null,
    detail: null,
    detailLoading: false,
    detailError: null,
};

const adminKycSlice = createSlice({
    name: 'adminKyc',
    initialState,
    reducers: {
        resetAdminKycState: (state) => {
            state.pendingList = [];
            state.pendingError = null;
            state.pendingLoading = false;
            state.pagination = null;
            state.detail = null;
            state.detailError = null;
            state.detailLoading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminPendingKyc.pending, (state) => {
                state.pendingLoading = true;
                state.pendingError = null;
            })
            .addCase(fetchAdminPendingKyc.fulfilled, (state, action: PayloadAction<AdminPendingKycResponse>) => {
                state.pendingLoading = false;
                state.pendingList = action.payload.data || [];
                state.pagination = action.payload.pagination || null;
            })
            .addCase(fetchAdminPendingKyc.rejected, (state, action) => {
                state.pendingLoading = false;
                state.pendingError = action.payload as string;
            });

        // Approve / Reject actions
        builder
            .addCase(approveAdminKyc.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
            })
            .addCase(approveAdminKyc.fulfilled, (state, action) => {
                state.actionLoading = false;
                // remove approved item from pending list (action.meta.arg is kycId)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const kycId: any = (action as any).meta?.arg;
                state.pendingList = state.pendingList.filter((i) => i.id !== kycId);
            })
            .addCase(approveAdminKyc.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload as string;
            });

        builder
            .addCase(rejectAdminKyc.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
            })
            .addCase(rejectAdminKyc.fulfilled, (state, action) => {
                state.actionLoading = false;
                // remove rejected item from pending list
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const kycId: any = (action as any).meta?.arg;
                state.pendingList = state.pendingList.filter((i) => i.id !== kycId);
            })
            .addCase(rejectAdminKyc.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload as string;
            });

        builder
            .addCase(fetchAdminKycDetail.pending, (state) => {
                state.detailLoading = true;
                state.detailError = null;
            })
            .addCase(fetchAdminKycDetail.fulfilled, (state, action: PayloadAction<AdminKycDetailResponse>) => {
                state.detailLoading = false;
                state.detail = action.payload;
            })
            .addCase(fetchAdminKycDetail.rejected, (state, action) => {
                state.detailLoading = false;
                state.detailError = action.payload as string;
            });
    },
});

export const { resetAdminKycState } = adminKycSlice.actions;
export default adminKycSlice.reducer;
