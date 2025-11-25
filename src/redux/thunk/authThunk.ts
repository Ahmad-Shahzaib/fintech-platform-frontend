// redux/thunk/authThunk.ts
import api from '@/lib/axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// --- Interfaces remain the same ---
interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
}

interface LoginData {
  email: string;
  password: string;
}

// --- Refactored registerUser using createAsyncThunk ---
export const registerUser = createAsyncThunk(
  'auth/registerUser', // Action type prefix
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      // First attempt
      let response = await api.post('/register', userData);

      // If the backend expects a CSRF token and we get a 419 error,
      // we fetch the cookie and retry once.
      if (response.status === 419) {
        await api.get('/sanctum/csrf-cookie');
        response = await api.post('/register', userData);
      }

      // Many backends return the created user and a token inside `data`.
      // Normalize the response and try to extract both user and token.
      const respData = response.data?.data ?? response.data;
      const token = respData?.token ?? respData?.access_token ?? null;
      const user = respData?.user ?? response.data?.user ?? null;

      if (response.data?.success || user) {
        // Do NOT persist token here for registration flow.
        // We want users to verify their email first and then sign in.

        // Return both user and token — this becomes `action.payload` in fulfilled
        return { user, token };
      }

      // If still here, treat as failure
      return rejectWithValue(response.data?.message || 'Registration failed');

    } catch (error: any) {
      // This catch block handles network errors or other unexpected issues.
      const errorMessage = error.response?.data?.message || error.message || 'An unknown network error occurred';
      return rejectWithValue(errorMessage);
    }
  }
);

// --- loginUser remains the same as it was already correct ---
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (payload: LoginData, { rejectWithValue }) => {
    try {
      const response = await api.post('/login', {
        email: payload.email,
        password: payload.password,
      });

      const respData = response.data?.data ?? response.data;
      const token = respData?.token ?? respData?.access_token ?? response.data?.token ?? null;
      const userPayload = respData?.user ?? response.data?.user ?? null;

      // Normalize user shape so the rest of the app receives consistent role string
      const user = userPayload
        ? {
          id: String(userPayload.id),
          email: userPayload.email,
          name: userPayload.name,
          // include email_verified so UI can check it before allowing login
          email_verified: userPayload.email_verified ?? userPayload.emailVerified ?? false,
          role:
            typeof userPayload.role === 'string' && (userPayload.role === 'admin' || userPayload.role === 'user')
              ? userPayload.role
              : typeof userPayload.role_id === 'number' && userPayload.role_id === 1
                ? 'admin'
                : 'user',
          avatar: userPayload.avatar ?? userPayload.user?.avatar,
        }
        : null;

      if (!token || !user) {
        return rejectWithValue(response.data?.message || 'Invalid login response');
      }

      try {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(user));
      } catch (e) {
        // ignore localStorage errors
      }

      return { user, token };
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || err.message || 'Login failed';
        return rejectWithValue(message);
      }
      return rejectWithValue('Network error');
    }
  }
);

// Thunk to resend verification email
export const resendVerification = createAsyncThunk(
  'auth/resendVerification',
  async (email: string, { rejectWithValue }) => {
    try {
      // Prefer authenticated resend (some backends require auth, e.g., Laravel)
      let response;
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      if (token || email) {
        // Send the email in the body and include Authorization when available
        response = await api.post('/email/verification-notification', { email }, { headers });
      } else {
        return rejectWithValue('No token or email provided to resend verification');
      }
      const message = response.data?.message ?? 'Verification email sent';
      return message;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        // If backend returns 403, provide a clear message
        const status = err.response?.status;
        const serverMsg = err.response?.data?.message;
        if (status === 403) {
          return rejectWithValue(serverMsg || 'Forbidden: resend verification requires authentication');
        }
        const message = serverMsg || err.message || 'Failed to resend verification';
        return rejectWithValue(message);
      }
      return rejectWithValue('Network error');
    }
  }
);