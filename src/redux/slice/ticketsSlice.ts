import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchTickets, SupportTicket } from '@/redux/thunk/ticketsThunk';

interface TicketsPagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from?: number;
  to?: number;
}

interface TicketsState {
  tickets: SupportTicket[];
  pagination: TicketsPagination | null;
  loading: boolean;
  error: string | null;
}

const initialState: TicketsState = {
  tickets: [],
  pagination: null,
  loading: false,
  error: null,
};

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    clearTickets(state) {
      state.tickets = [];
      state.pagination = null;
      state.loading = false;
      state.error = null;
    },
    resetError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        // Extract tickets array from response - API returns { data: [...], current_page, per_page, total, ... }
        const ticketData = action.payload?.data || action.payload;
        state.tickets = Array.isArray(ticketData) ? ticketData : [];
        
        // Extract pagination info from the payload
        const paginationInfo: TicketsPagination = {
          current_page: action.payload?.current_page || 1,
          per_page: action.payload?.per_page || 10,
          total: action.payload?.total || 0,
          last_page: action.payload?.last_page || 1,
          from: action.payload?.from,
          to: action.payload?.to,
        };
        state.pagination = paginationInfo;
        state.error = null;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch tickets';
        state.tickets = [];
      });
  },
});

export const { clearTickets, resetError } = ticketsSlice.actions;
export default ticketsSlice.reducer;
