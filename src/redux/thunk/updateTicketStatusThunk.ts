import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import axios from 'axios';

export interface UpdateTicketStatusPayload {
  ticketId: number;
  status: string;
  message?: string;
}

export interface UpdateTicketStatusResponse {
  message: string;
  data: {
    ticket_id: number;
    status: string;
  };
}

export const updateTicketStatus = createAsyncThunk(
  'adminTickets/updateStatus',
  async (
    payload: UpdateTicketStatusPayload,
    { rejectWithValue }
  ) => {
    try {
      const requestData: any = {
        status: payload.status,
      };

      // Add message if provided
      if (payload.message && payload.message.trim()) {
        requestData.message = payload.message;
      }

      const response = await api.post<UpdateTicketStatusResponse>(
        `/admin/support/tickets/${payload.ticketId}/update-status`,
        requestData
      );

      return response.data?.data ?? response.data;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const message =
          err.response?.data?.message ||
          err.message ||
          'Failed to update ticket status';
        return rejectWithValue(message);
      }
      return rejectWithValue('Network error');
    }
  }
);
