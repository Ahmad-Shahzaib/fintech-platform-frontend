import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { updateTicketStatus } from '@/redux/thunk/updateTicketStatusThunk';

interface UpdateTicketStatusState {
  loading: boolean;
  error: string | null;
  success: boolean;
  data: {
    ticket_id: number | null;
    status: string | null;
  } | null;
}

const initialState: UpdateTicketStatusState = {
  loading: false,
  error: null,
  success: false,
  data: null,
};

const updateTicketStatusSlice = createSlice({
  name: 'updateTicketStatus',
  initialState,
  reducers: {
    clearUpdateStatus(state) {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.data = null;
    },
    resetError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateTicketStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(
        updateTicketStatus.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.success = true;
          state.error = null;
          state.data = {
            ticket_id: action.payload?.ticket_id || null,
            status: action.payload?.status || null,
          };
        }
      )
      .addCase(updateTicketStatus.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error =
          (action.payload as string) || 'Failed to update ticket status';
        state.data = null;
      });
  },
});

export const { clearUpdateStatus, resetError } = updateTicketStatusSlice.actions;
export default updateTicketStatusSlice.reducer;
