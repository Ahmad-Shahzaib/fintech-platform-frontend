import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import axios from 'axios';

export interface TicketsQuery {
  page?: number;
  status?: string;
}

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

export interface SupportTicket {
  id: number;
  user_id: number;
  subject: string;
  issue_type: string;
  priority_level: string;
  description: string;
  attachment: string;
  status: string;
  created_at: string;
  updated_at: string;
  messages: TicketMessage[];
}

export interface TicketsPagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface TicketsResponse {
  data: SupportTicket[];
  pagination?: TicketsPagination;
  current_page?: number;
  per_page?: number;
  total?: number;
  last_page?: number;
  from?: number;
  to?: number;
}

export const fetchTickets = createAsyncThunk(
  'tickets/fetchList',
  async (params: TicketsQuery = { page: 1 }, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set('page', String(params.page));
      if (params.status) query.set('status', params.status);

      const response = await api.get(`/user/support/tickets?${query.toString()}`);
      // API returns { message, data: { data: tickets[], current_page, per_page, ... } }
      return response.data?.data ?? response.data;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || err.message || 'Failed to fetch tickets';
        return rejectWithValue(message);
      }
      return rejectWithValue('Network error');
    }
  }
);
