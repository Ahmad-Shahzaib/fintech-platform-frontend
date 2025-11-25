import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../lib/axios';

interface FetchParams {
    page?: number;
    search?: string;
    status?: string;
}

export interface UsersState {
    users: any[];
    loading: boolean;
    error: string | null;
    meta?: any;
}

export const fetchUsers = createAsyncThunk('users/fetchUsers', async (params: FetchParams = {}) => {
    const { page = 1, search = '', status = '' } = params;
    const response = await axios.get('/admin/users', { params: { page, search, status } });
    return response.data;
});

const initialState: UsersState = {
    users: [],
    loading: false,
    error: null,
    meta: undefined,
};

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchUsers.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchUsers.fulfilled, (state, action) => {
            state.loading = false;
            const payload = action.payload;

            // Helper to extract the actual array of users from multiple shapes
            const tryExtract = (p: any): any[] | undefined => {
                if (!p) return undefined;
                if (Array.isArray(p)) return p;
                if (Array.isArray(p.data)) return p.data; // shape: { data: [...] }
                if (Array.isArray(p.users)) return p.users;
                if (p.data && Array.isArray(p.data.data)) return p.data.data; // Laravel paginator: { data: { data: [...] , current_page... } }
                return undefined;
            };

            const extracted = tryExtract(payload);
            if (extracted) {
                state.users = extracted;
                // extract pagination/meta info if available
                if (payload && payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
                    // payload.data is likely the paginator object
                    state.meta = payload.data;
                } else if (payload && typeof payload === 'object' && payload.current_page) {
                    // payload itself might be paginator
                    state.meta = payload;
                } else if (payload && payload.meta) {
                    state.meta = payload.meta;
                } else {
                    state.meta = undefined;
                }
            } else {
                // fallback: if nothing matched, attempt to see if payload.data is paginator
                if (payload && payload.data && payload.data.data && Array.isArray(payload.data.data)) {
                    state.users = payload.data.data;
                    state.meta = payload.data;
                } else {
                    state.users = [];
                    state.meta = undefined;
                }
            }
        });
        builder.addCase(fetchUsers.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error?.message || 'Failed to fetch users';
        });
    },
});

export default usersSlice.reducer;
