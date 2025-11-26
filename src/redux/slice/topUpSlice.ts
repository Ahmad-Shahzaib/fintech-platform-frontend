import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createTopUpRequest } from '@/redux/thunk/topUpThunks';

interface TopUpState {
    data: Record<string, any> | null;
    loading: boolean;
    error: string | null;
    message: string | null;
}

const initialState: TopUpState = {
    data: null,
    loading: false,
    error: null,
    message: null,
};

const topUpSlice = createSlice({
    name: 'topUp',
    initialState,
    reducers: {
        clearTopUpState(state) {
            state.data = null;
            state.loading = false;
            state.error = null;
            state.message = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createTopUpRequest.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(createTopUpRequest.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.data = action.payload?.data ?? null;
                state.message = action.payload?.message ?? null;
                state.error = null;
            })
            .addCase(createTopUpRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || action.error.message || 'Failed to create top-up request';
            });
    },
});

export const { clearTopUpState } = topUpSlice.actions;
export default topUpSlice.reducer;
