import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchTicketMessages, sendTicketMessage, TicketMessage } from '@/redux/thunk/ticketMessagesThunk';

interface TicketMessagesState {
  messages: TicketMessage[];
  loading: boolean;
  sending: boolean;
  error: string | null;
  sendError: string | null;
}

const initialState: TicketMessagesState = {
  messages: [],
  loading: false,
  sending: false,
  error: null,
  sendError: null,
};

const ticketMessagesSlice = createSlice({
  name: 'ticketMessages',
  initialState,
  reducers: {
    clearMessages(state) {
      state.messages = [];
      state.error = null;
    },
    clearSendError(state) {
      state.sendError = null;
    },
    addMessage(state, action: PayloadAction<TicketMessage>) {
      state.messages.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch messages
      .addCase(fetchTicketMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTicketMessages.fulfilled, (state, action: PayloadAction<TicketMessage[]>) => {
        state.loading = false;
        state.messages = action.payload;
        state.error = null;
      })
      .addCase(fetchTicketMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch messages';
        state.messages = [];
      })
      // Send message
      .addCase(sendTicketMessage.pending, (state) => {
        state.sending = true;
        state.sendError = null;
      })
      .addCase(sendTicketMessage.fulfilled, (state, action: PayloadAction<TicketMessage>) => {
        state.sending = false;
        state.messages.push(action.payload);
        state.sendError = null;
      })
      .addCase(sendTicketMessage.rejected, (state, action) => {
        state.sending = false;
        state.sendError = (action.payload as string) || 'Failed to send message';
      });
  },
});

export const { clearMessages, clearSendError, addMessage } = ticketMessagesSlice.actions;
export default ticketMessagesSlice.reducer;
