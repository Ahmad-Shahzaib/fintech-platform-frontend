import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import axios from 'axios';

export interface SubmitTicketPayload {
  subject: string;
  issue_type: string;
  priority_level: string;
  description: string;
  attachment?: File | null;
}

export interface SubmitTicketResponse {
  message: string;
  data: {
    id: number;
    subject: string;
    issue_type: string;
    status: string;
  };
}

export interface SubmitTicketState {
  ticket: SubmitTicketResponse['data'] | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export const submitTicket = createAsyncThunk(
  'ticket/submit',
  async (payload: SubmitTicketPayload, { rejectWithValue }) => {
    try {
      // Create FormData to handle file upload
      const formData = new FormData();
      formData.append('subject', payload.subject);
      formData.append('issue_type', payload.issue_type);
      formData.append('priority_level', payload.priority_level);
      formData.append('description', payload.description);
      
      if (payload.attachment) {
        formData.append('attachment', payload.attachment);
      }

      const response = await api.post<SubmitTicketResponse>(
        '/user/submit-ticket',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || err.message || 'Failed to submit ticket';
        return rejectWithValue(message);
      }
      return rejectWithValue('Network error');
    }
  }
);
