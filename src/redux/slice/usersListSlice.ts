import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchAllUsers, UserResponse, UsersPaginationResponse } from '@/redux/thunk/usersListThunks';

interface UsersListState {
    items: UserResponse[];
    pagination: UsersPaginationResponse | null;
    loading: boolean;
    error: string | null;
}

const initialState: UsersListState = {
    items: [],
    pagination: null,
    loading: false,
    error: null,
};

const usersListSlice = createSlice({
    name: 'usersList',
    initialState,
    reducers: {
        clearUsersList(state) {
            state.items = [];
            state.pagination = null;
            state.loading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllUsers.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.items = Array.isArray(action.payload?.data) ? action.payload.data : [];
                state.pagination = action.payload?.pagination ?? null;
                state.error = null;
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || action.error.message || 'Failed to load users';
            });
    }
});

export const { clearUsersList } = usersListSlice.actions;
export default usersListSlice.reducer;
