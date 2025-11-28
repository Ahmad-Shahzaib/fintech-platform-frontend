import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { updateCurrencyNetwork } from '@/redux/thunk/currencyNetworkThunks';

interface UpdateState {
  data: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: UpdateState = {
  data: null,
  loading: false,
  error: null,
};

const slice = createSlice({
  name: 'currencyNetworkUpdate',
  initialState,
  reducers: {
    clearUpdate(state) {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(updateCurrencyNetwork.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateCurrencyNetwork.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.data = action.payload;
    });
    builder.addCase(updateCurrencyNetwork.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || action.error.message || 'Failed to update';
    });
  },
});

export const { clearUpdate } = slice.actions;
export default slice.reducer;
