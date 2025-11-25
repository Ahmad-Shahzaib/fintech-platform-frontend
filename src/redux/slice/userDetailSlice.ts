import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchUserDetail } from '../thunk/userThunks';

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
    },
});

export const { clearUserDetail, setUserDetail } = userDetailSlice.actions;
export default userDetailSlice.reducer;
