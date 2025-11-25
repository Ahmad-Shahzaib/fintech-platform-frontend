// File: redux/thunk/userProfileThunks.ts  (or wherever your thunks are)

import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

// Fetch remains unchanged — already perfect
export const fetchUserProfile = createAsyncThunk(
    'userProfile/fetch',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/user/profile');
            const payload = response.data?.data ?? response.data;
            return payload;
        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.message || 'Failed to fetch user profile';
            return rejectWithValue(msg);
        }
    }
);

// ONLY THIS ONE IS FIXED — handles your real API response correctly
export const updateUserProfile = createAsyncThunk(
    'userProfile/update',
    async (updates: Record<string, any>, { rejectWithValue }) => {
        try {
            const response = await api.put('/user/profile', updates);

            // Your real API response is:
            // { "name": "...", "phone": "..." }
            // { "message": "Profile updated successfully" }
            // So response.data is often an ARRAY or just the first object

            let updatedUser: any = null;

            if (Array.isArray(response.data)) {
                // Case 1: response.data = [ {user}, {message} ] → pick the one with name/phone
                updatedUser = response.data.find((item: any) =>
                    item && (item.name !== undefined || item.phone !== undefined || item.email !== undefined)
                );
            } else if (response.data && (response.data.name || response.data.phone || response.data.email)) {
                // Case 2: response.data = {user} directly
                updatedUser = response.data;
            } else if (response.data?.data && (response.data.data.name || response.data.data.phone)) {
                // Case 3: wrapped like { data: {user}, message: ... }
                updatedUser = response.data.data;
            }

            // Final fallback: if nothing matched, use the sent updates (still better than nothing)
            if (!updatedUser) {
                console.warn('Updated user not found in response, falling back to sent data:', updates);
                updatedUser = updates;
            }

            return updatedUser; // This gets merged perfectly in your slice
        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.message || 'Failed to update user profile';
            return rejectWithValue(msg);
        }
    }
);