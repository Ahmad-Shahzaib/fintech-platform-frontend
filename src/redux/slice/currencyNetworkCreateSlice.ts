import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createCurrencyNetwork } from '@/redux/thunk/currencyNetworkThunks';

interface CreateState {
  data: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: CreateState = {
  data: null,
  loading: false,
  error: null,
};

const slice = createSlice({
  name: 'currencyNetworkCreate',
  initialState,
  reducers: {
    clearCreate(state) {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(createCurrencyNetwork.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createCurrencyNetwork.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.data = action.payload;
    });
    builder.addCase(createCurrencyNetwork.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || action.error.message || 'Failed to create';
    });
  },
});

export const { clearCreate } = slice.actions;
export default slice.reducer;
