import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import axios from 'axios';

export interface SendTicketMessagePayload {
  ticketId: number;
  message: string;
  attachment?: File | null;
}

export interface TicketMessage {
  id: number;
  support_ticket_id: number;
  sender_type: string;
  message: string;
  attachment: string | null;
  created_at: string;
}

export interface SendTicketMessageResponse {
  message: string;
  data: TicketMessage;
}

export const sendTicketMessage = createAsyncThunk(
  'sendTicketMessage/send',
  async (
    payload: SendTicketMessagePayload,
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append('message', payload.message);

      if (payload.attachment) {
        formData.append('attachment', payload.attachment);
      }

      const response = await api.post<SendTicketMessageResponse>(
        `/admin/support/tickets/${payload.ticketId}/send-message`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data?.data ?? response.data;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const message =
          err.response?.data?.message ||
          err.message ||
          'Failed to send message';
        return rejectWithValue(message);
      }
      return rejectWithValue('Network error');
    }
  }
);
