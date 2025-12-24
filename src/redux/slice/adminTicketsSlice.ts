import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchAdminTickets, SupportTicket } from '@/redux/thunk/adminTicketsThunk';

interface AdminTicketsPagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from?: number;
  to?: number;
}

interface AdminTicketsState {
  tickets: SupportTicket[];
  pagination: AdminTicketsPagination | null;
  loading: boolean;
  error: string | null;
}

const initialState: AdminTicketsState = {
  tickets: [],
  pagination: null,
  loading: false,
  error: null,
};

const adminTicketsSlice = createSlice({
  name: 'adminTickets',
  initialState,
  reducers: {
    clearAdminTickets(state) {
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
      .addCase(fetchAdminTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAdminTickets.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          
          // Extract tickets array from response
          // API response structure: { data: { current_page, data: [...], per_page, total, ... } }
          const responseData = action.payload;
          
          if (responseData.data && Array.isArray(responseData.data)) {
            // Response has nested data structure
            state.tickets = responseData.data;
            state.pagination = {
              current_page: responseData.current_page || 1,
              per_page: responseData.per_page || 15,
              total: responseData.total || 0,
              last_page: responseData.last_page || 1,
              from: responseData.from,
              to: responseData.to,
            };
          } else if (Array.isArray(responseData)) {
            // Response is just an array of tickets
            state.tickets = responseData;
            state.pagination = null;
          }
          
          state.error = null;
        }
      )
      .addCase(fetchAdminTickets.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || 'Failed to fetch admin tickets';
        state.tickets = [];
      });
  },
});

export const { clearAdminTickets, resetError } = adminTicketsSlice.actions;
export default adminTicketsSlice.reducer;
