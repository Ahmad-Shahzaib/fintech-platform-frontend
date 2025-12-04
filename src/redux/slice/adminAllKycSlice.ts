import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchAdminAllKyc, type AdminAllKycResponse, type AdminAllKycItem } from '../thunk/adminAllKycThunks';

interface AdminAllKycState {
    list: AdminAllKycItem[];
    loading: boolean;
    error: string | null;
    pagination: AdminAllKycResponse['pagination'] | null;
}

const initialState: AdminAllKycState = {
    list: [],
    loading: false,
    error: null,
    pagination: null,
};

const adminAllKycSlice = createSlice({
    name: 'adminAllKyc',
    initialState,
    reducers: {
        resetAdminAllKycState: (state) => {
            state.list = [];
            state.loading = false;
            state.error = null;
            state.pagination = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminAllKyc.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdminAllKyc.fulfilled, (state, action: PayloadAction<AdminAllKycResponse>) => {
                state.loading = false;
                state.list = action.payload.data || [];
                state.pagination = action.payload.pagination || null;
            })
            .addCase(fetchAdminAllKyc.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { resetAdminAllKycState } = adminAllKycSlice.actions;
export default adminAllKycSlice.reducer;
