import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { sendTicketMessage, TicketMessage } from '@/redux/thunk/sendTicketMessageThunk';

interface SendTicketMessageState {
  loading: boolean;
  error: string | null;
  success: boolean;
  data: TicketMessage | null;
}

const initialState: SendTicketMessageState = {
  loading: false,
  error: null,
  success: false,
  data: null,
};

const sendTicketMessageSlice = createSlice({
  name: 'sendTicketMessage',
  initialState,
  reducers: {
    clearSendMessage(state) {
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
      .addCase(sendTicketMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(
        sendTicketMessage.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.success = true;
          state.error = null;
          state.data = action.payload;
        }
      )
      .addCase(sendTicketMessage.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error =
          (action.payload as string) || 'Failed to send message';
        state.data = null;
      });
  },
});

export const { clearSendMessage, resetError } = sendTicketMessageSlice.actions;
export default sendTicketMessageSlice.reducer;
