import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchAdminLatestTopUps } from '@/redux/thunk/adminLatestTopUpsThunks';

type LatestTopUpsState = {
  items: any[];
  loading: boolean;
  error: string | null;
};

const initialState: LatestTopUpsState = {
  items: [],
  loading: false,
  error: null,
};

const adminLatestTopUpsSlice = createSlice({
  name: 'adminLatestTopUps',
  initialState,
  reducers: {
    clearLatest(state) {
      state.items = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers(builder) {
    builder.addCase(fetchAdminLatestTopUps.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAdminLatestTopUps.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      // Keep raw response shape in case it contains message/pagination
      // If API returns { message, data }, prefer data array
      const payload = action.payload ?? {};
      if (payload && Array.isArray(payload.data)) {
        state.items = payload.data;
      } else if (Array.isArray(payload)) {
        state.items = payload;
      } else {
        state.items = payload.data ?? [];
      }
    });
    builder.addCase(fetchAdminLatestTopUps.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || action.error?.message || 'Failed to load latest top-ups';
    });
  },
});

export const { clearLatest } = adminLatestTopUpsSlice.actions;
export default adminLatestTopUpsSlice.reducer;
