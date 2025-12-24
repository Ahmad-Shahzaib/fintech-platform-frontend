import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import axios from 'axios';

export interface TicketMessage {
  id: number;
  support_ticket_id: number;
  sender_id: number;
  sender_type: string;
  message: string;
  attachment: string | null;
  created_at: string;
  updated_at: string;
}

export interface TicketMessagesResponse {
  message: string;
  data: TicketMessage[];
}

export const fetchTicketMessages = createAsyncThunk(
  'ticketMessages/fetch',
  async (ticketId: number | string, { rejectWithValue }) => {
    try {
      const response = await api.get<TicketMessagesResponse>(
        `/user/support/tickets/${ticketId}/messages`
      );
      return response.data?.data || [];
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch messages';
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue('Network error');
    }
  }
);

export interface SendMessagePayload {
  ticketId: number | string;
  message: string;
  attachment?: File | null;
}

export interface SendMessageResponse {
  message: string;
  data: TicketMessage;
}

export const sendTicketMessage = createAsyncThunk(
  'ticketMessages/send',
  async (payload: SendMessagePayload, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('message', payload.message);
      if (payload.attachment) {
        formData.append('attachment', payload.attachment);
      }

      const response = await api.post<SendMessageResponse>(
        `/user/support/tickets/${payload.ticketId}/send-message`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data?.data;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to send message';
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue('Network error');
    }
  }
);
