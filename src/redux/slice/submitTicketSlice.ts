import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { submitTicket, SubmitTicketResponse } from '@/redux/thunk/submitTicketThunk';

interface SubmitTicketState {
  ticket: SubmitTicketResponse['data'] | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: SubmitTicketState = {
  ticket: null,
  loading: false,
  error: null,
  success: false,
};

const submitTicketSlice = createSlice({
  name: 'submitTicket',
  initialState,
  reducers: {
    resetSubmitTicket(state) {
      state.ticket = null;
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(submitTicket.fulfilled, (state, action: PayloadAction<SubmitTicketResponse>) => {
        state.loading = false;
        state.ticket = action.payload.data;
        state.success = true;
        state.error = null;
      })
      .addCase(submitTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to submit ticket';
        state.success = false;
        state.ticket = null;
      });
  },
});

export const { resetSubmitTicket, clearError } = submitTicketSlice.actions;
export default submitTicketSlice.reducer;
