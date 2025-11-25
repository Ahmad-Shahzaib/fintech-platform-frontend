import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchUserProfile, updateUserProfile } from '../thunk/userProfileThunks';

interface UserProfileState {
    data: Record<string, any> | null;
    loading: boolean;
    error: string | null;
}

const initialState: UserProfileState = {
    data: null,
    loading: false,
    error: null,
};

const userProfileSlice = createSlice({
    name: 'userProfile',
    initialState,
    reducers: {
        clearUserProfile(state) {
            state.data = null;
            state.error = null;
            state.loading = false;
        },
        setUserProfile(state, action: PayloadAction<Record<string, any>>) {
            state.data = action.payload;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchUserProfile
            .addCase(fetchUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.data = action.payload;
                state.error = null;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || action.error.message || 'Failed to fetch profile';
            })

            // updateUserProfile
            .addCase(updateUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUserProfile.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                // Merge incoming data into existing state.data
                state.data = { ...(state.data ?? {}), ...(action.payload ?? {}) };
                state.error = null;
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || action.error.message || 'Failed to update profile';
            });
    },
});

export const { clearUserProfile, setUserProfile } = userProfileSlice.actions;
export default userProfileSlice.reducer;
