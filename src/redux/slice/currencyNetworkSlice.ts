import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchCurrencyNetworkDetail, CurrencyNetworkDetail } from '@/redux/thunk/currencyNetworkThunks';

interface CurrencyNetworkState {
  data: CurrencyNetworkDetail | null;
  loading: boolean;
  error: string | null;
}

const initialState: CurrencyNetworkState = {
  data: null,
  loading: false,
  error: null,
};

const slice = createSlice({
  name: 'currencyNetworkDetail',
  initialState,
  reducers: {
    clear(state) {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCurrencyNetworkDetail.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCurrencyNetworkDetail.fulfilled, (state, action: PayloadAction<CurrencyNetworkDetail>) => {
      state.loading = false;
      state.data = action.payload;
    });
    builder.addCase(fetchCurrencyNetworkDetail.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || action.error.message || 'Failed to load';
    });
  },
});

export const { clear } = slice.actions;
export default slice.reducer;
