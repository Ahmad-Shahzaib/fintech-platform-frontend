// redux/slice/networksSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchNetworks, createNetwork, updateNetwork, fetchNetworkById } from '@/redux/thunk/networkThunks';


interface Network {
  id: number;
  code: string;
  name: string;
  full_name: string;
  description: string;
  icon_url?: string;
  chain_id: number | null;
  rpc_url?: string;
  explorer_url?: string;
  address_format?: string;
  avg_transaction_fee_aud: number;
  avg_confirmation_time_minutes?: number;
  is_active?: boolean;
  requires_checksum: boolean;
  confirmations_required?: number;
  sort_order?: number;
}

interface NetworksState {
  items: Network[];
  loading: boolean;
  error: string | null;
  current: Network | null;
  detailLoading: boolean;
  detailError: string | null;
}

const initialState: NetworksState = {
  items: [],
  loading: false,
  error: null,
  current: null,
  detailLoading: false,
  detailError: null,
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

    builder
      .addCase(createNetwork.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNetwork.fulfilled, (state, action: PayloadAction<Network>) => {
        state.loading = false;
        // append created network
        state.items = state.items.concat(action.payload);
      })
      .addCase(createNetwork.rejected, (state, action) => {
        state.loading = false;
        const anyAction: any = action;
        state.error = anyAction.payload || anyAction.error?.message || 'Failed to create network';
      });

    builder
      .addCase(updateNetwork.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNetwork.fulfilled, (state, action: PayloadAction<Network>) => {
        state.loading = false;
        const updated = action.payload;
        state.items = state.items.map((it) => (it.id === updated.id ? updated : it));
      })
      .addCase(updateNetwork.rejected, (state, action) => {
        state.loading = false;
        const anyAction: any = action;
        state.error = anyAction.payload || anyAction.error?.message || 'Failed to update network';
      });

    // handle fetching single network detail
    builder
      .addCase(fetchNetworkById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
        state.current = null;
      })
      .addCase(fetchNetworkById.fulfilled, (state, action: PayloadAction<Network>) => {
        state.detailLoading = false;
        state.current = action.payload ?? null;
        state.detailError = null;
      })
      .addCase(fetchNetworkById.rejected, (state, action) => {
        state.detailLoading = false;
        const anyAction: any = action;
        state.detailError = anyAction.payload || anyAction.error?.message || 'Failed to fetch network detail';
      });
  },
});

export default networksSlice.reducer;