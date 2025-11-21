// redux/thunk/authThunk.ts
import { AppDispatch } from '@/redux/store';
import { registerUserPending, registerUserFulfilled, registerUserRejected } from '@/redux/slice/authSlice';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
}

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
  }
}