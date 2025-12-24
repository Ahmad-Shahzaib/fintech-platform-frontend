import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import axios from 'axios';

export interface AdminTicketsQuery {
  page?: number;
  status?: string;
  priority_level?: string;
  issue_type?: string;
}

export interface TicketMessage {
  id: number;
  support_ticket_id: number;
  sender_id: number;
  sender_type: 'admin' | 'user';
  message: string | null;
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
  attachment: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  messages: TicketMessage[];
}

export interface AdminTicketsResponse {
  message: string;
  data: {
    current_page: number;
    data: SupportTicket[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

export const fetchAdminTickets = createAsyncThunk(
  'adminTickets/fetchList',
  async (params: AdminTicketsQuery = { page: 1 }, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set('page', String(params.page));
      if (params.status) query.set('status', params.status);
      if (params.priority_level) query.set('priority_level', params.priority_level);
      if (params.issue_type) query.set('issue_type', params.issue_type);

      const response = await api.get<AdminTicketsResponse>(
        `/admin/support/tickets?${query.toString()}`
      );
      
      return response.data?.data ?? response.data;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || err.message || 'Failed to fetch admin tickets';
        return rejectWithValue(message);
      }
      return rejectWithValue('Network error');
    }
  }
);
