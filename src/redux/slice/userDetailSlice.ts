import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchUserDetail, blockUser, unblockUser, updateUser, updateUserLimit } from '../thunk/userThunks';

interface UserDetailState {
    data: Record<string, any> | null;
    loading: boolean;
    error: string | null;
}

const initialState: UserDetailState = {
    data: null,
    loading: false,
    error: null,
};

const userDetailSlice = createSlice({
    name: 'userDetail',
    initialState,
    reducers: {
        clearUserDetail(state) {
            state.data = null;
            state.loading = false;
            state.error = null;
        },
        setUserDetail(state, action: PayloadAction<any>) {
            state.data = action.payload;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserDetail.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserDetail.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                // payload may be wrapped like { data: { ... } }
                const payload = action.payload;
                state.data = payload?.data ?? payload;
                state.error = null;
            })
            .addCase(fetchUserDetail.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || action.error?.message || 'Failed to fetch user';
            });

        // Block user
        builder
            .addCase(blockUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(blockUser.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                const payload = action.payload;
                // update stored user detail if present
                const updated = payload?.data ?? payload;
                if (updated) state.data = { ...state.data, ...updated };
                state.error = null;
            })
            .addCase(blockUser.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || action.error?.message || 'Failed to block user';
            });

        // Unblock user
        builder
            .addCase(unblockUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(unblockUser.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                const payload = action.payload;
                const updated = payload?.data ?? payload;
                if (updated) state.data = { ...state.data, ...updated };
                state.error = null;
            })
            .addCase(unblockUser.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || action.error?.message || 'Failed to unblock user';
            });

        // Update user
        builder
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                const payload = action.payload;
                const updated = payload?.data ?? payload;
                if (updated) state.data = { ...state.data, ...updated };
                state.error = null;
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || action.error?.message || 'Failed to update user';
            });

        // Update transaction limit
        builder
            .addCase(updateUserLimit.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUserLimit.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                const payload = action.payload;
                const updated = payload?.data ?? payload;
                if (updated) state.data = { ...state.data, ...updated };
                state.error = null;
            })
            .addCase(updateUserLimit.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || action.error?.message || 'Failed to update transaction limit';
            });
    },
});

export const { clearUserDetail, setUserDetail } = userDetailSlice.actions;
export default userDetailSlice.reducer;
