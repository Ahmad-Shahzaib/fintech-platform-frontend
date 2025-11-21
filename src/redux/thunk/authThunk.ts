// redux/thunk/authThunk.ts
<<<<<<< HEAD
import api from '@/lib/axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
=======
import { AppDispatch } from '@/redux/store';
import { registerUserPending, registerUserFulfilled, registerUserRejected } from '@/redux/slice/authSlice';
>>>>>>> dc389fb49d188bb7b44892c1840e2c6efd14abd1

// --- Interfaces remain the same ---
interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
}

<<<<<<< HEAD
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
        // Persist token (if provided) for later requests
        if (token) {
          try {
            localStorage.setItem('auth_token', token);
          } catch (e) {
            // ignore localStorage errors
          }
        }

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
=======
interface RegisterResponse {
  message?: string;
  data?: {
    user?: {
      id?: number | string;
      name?: string;
      email?: string;
      phone?: string;
      email_verified?: boolean;
    };
  };
}

export const registerUser = (userData: RegisterData) => async (dispatch: AppDispatch) => {
  try {
    dispatch(registerUserPending());
    
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    const data: RegisterResponse = await response.json();
    
    if (!response.ok) {
      const failMessage = data?.message || 'Registration failed';
      dispatch(registerUserRejected(failMessage));
      return { error: failMessage };
    }

    const registeredUser = data?.data?.user;
    if (registeredUser) {
      const normalizedUser = {
        id: registeredUser.id ? String(registeredUser.id) : '',
        name: registeredUser.name ?? userData.name,
        email: registeredUser.email ?? userData.email,
        phone: registeredUser.phone ?? userData.phone,
        email_verified: registeredUser.email_verified,
      };
      
      dispatch(registerUserFulfilled(normalizedUser));
      return data;
    } else {
      const failMessage = data?.message || 'Registration failed';
      dispatch(registerUserRejected(failMessage));
      return { error: failMessage };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
    dispatch(registerUserRejected(errorMessage));
    return { error: errorMessage };
>>>>>>> dc389fb49d188bb7b44892c1840e2c6efd14abd1
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

      const respData = response.data?.data;
      const token = respData?.token ?? null;
      const user = respData?.user ?? null;

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