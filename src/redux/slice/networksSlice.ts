// redux/slice/networksSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchNetworks } from '@/redux/thunk/networkThunks';

interface Network {
  id: number;
  code: string;
  name: string;
  full_name: string;
  description: string;
  chain_id: string | null;
  avg_transaction_fee_aud: string;
  requires_checksum: boolean;
}

interface NetworksState {
  items: Network[];
  loading: boolean;
  error: string | null;
}

const initialState: NetworksState = {
  items: [],
  loading: false,
  error: null,
};

const networksSlice = createSlice({
  name: 'networks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNetworks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNetworks.fulfilled, (state, action: PayloadAction<Network[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchNetworks.rejected, (state, action) => {
        state.loading = false;
        // rejected action may have a payload (rejectWithValue) or an error
        // prefer payload if present
        // action has type: RejectedAction which may include payload, but typing here as any for safety
        const anyAction: any = action;
        state.error = anyAction.payload || anyAction.error?.message || 'Failed to fetch networks';
      });
  },
});

export default networksSlice.reducer;