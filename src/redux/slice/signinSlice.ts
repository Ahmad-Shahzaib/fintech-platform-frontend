// @/redux/slice/signinSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
    id: number;
    name: string;
    email: string;
    email_verified: boolean;
    kyc_status: string;
    status: string;
}

interface SigninState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}

const initialState: SigninState = {
    user: null,
    token: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
};

const signinSlice = createSlice({
    name: 'signin',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            // Also clear the token from localStorage on logout
            localStorage.removeItem('authToken');
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase('auth/signinUser/pending' as any, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase('auth/signinUser/fulfilled' as any, (state, action: PayloadAction<{ user: User; token: string }>) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.error = null; // Clear any previous error on success
            })
            .addCase('auth/signinUser/rejected' as any, (state, action: PayloadAction<string>) => {
                state.isLoading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
            });
    },
});

export const { clearError, logout } = signinSlice.actions;
export default signinSlice.reducer;