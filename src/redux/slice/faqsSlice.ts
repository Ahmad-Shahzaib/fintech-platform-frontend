import { createSlice } from '@reduxjs/toolkit';
import createFaq from '../thunk/faqsThunk';
import fetchFaqs from '../thunk/fetchFaqsThunk';
import deleteFaq from '../thunk/deleteFaqThunk';

interface FaqsState {
  faqs: any[];
  fetching: boolean;
  fetchError: string | null;
  loading: boolean; // create loading
  success: boolean; // create success
  error: string | null; // create error
  deletingId: string | null;
  deleteError: string | null;
}

const initialState: FaqsState = {
  faqs: [],
  fetching: false,
  fetchError: null,
  loading: false,
  success: false,
  error: null,
  deletingId: null,
  deleteError: null,
};

const faqsSlice = createSlice({
  name: 'faqs',
  initialState,
  reducers: {
    resetFaqStatus(state) {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetch list
    builder.addCase(fetchFaqs.pending, (state) => {
      state.fetching = true;
      state.fetchError = null;
    });
    builder.addCase(fetchFaqs.fulfilled, (state, action) => {
      state.fetching = false;
      state.fetchError = null;
      // assume API returns array
      state.faqs = Array.isArray(action.payload) ? action.payload : [];
    });
    builder.addCase(fetchFaqs.rejected, (state, action) => {
      state.fetching = false;
      state.fetchError = (action.payload as string) || action.error.message || 'Failed to fetch FAQs';
    });

    // create
    builder.addCase(createFaq.pending, (state) => {
      state.loading = true;
      state.success = false;
      state.error = null;
    });
    builder.addCase(createFaq.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.error = null;
      // If API returned the created FAQ (or list), attempt to add it
      if (action.payload) {
        if (Array.isArray(action.payload)) {
          state.faqs = action.payload;
        } else {
          state.faqs.unshift(action.payload);
        }
      }
    });
    builder.addCase(createFaq.rejected, (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = (action.payload as string) || action.error.message || 'Failed to create FAQ';
    });

    // delete
    builder.addCase(deleteFaq.pending, (state, action) => {
      state.deletingId = action.meta.arg as string;
      state.deleteError = null;
    });
    builder.addCase(deleteFaq.fulfilled, (state, action) => {
      state.deletingId = null;
      state.deleteError = null;
      const id = action.payload as string;
      state.faqs = state.faqs.filter((f: any) => String(f.id) !== String(id));
    });
    builder.addCase(deleteFaq.rejected, (state, action) => {
      state.deletingId = null;
      state.deleteError = (action.payload as string) || action.error.message || 'Failed to delete FAQ';
    });
  },
});

export const { resetFaqStatus } = faqsSlice.actions;
export default faqsSlice.reducer;
