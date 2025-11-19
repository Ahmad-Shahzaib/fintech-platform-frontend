// redux/thunk/authThunk.ts
import api from '@/lib/axios';
import { AppDispatch } from '@/redux/store';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
}

export const registerUser = (userData: RegisterData) => async (dispatch: AppDispatch) => {
  try {
    dispatch({ type: 'auth/registerUser/pending' });
    
    // Try changing the endpoint path here
    const response = await api.post('/register', userData); // or '/users/register' or whatever the correct path is
    
    if (response.data.success) {
      dispatch({ 
        type: 'auth/registerUser/fulfilled', 
        payload: response.data.user 
      });
      return response.data;
    } else {
      dispatch({ 
        type: 'auth/registerUser/rejected', 
        payload: response.data.message || 'Registration failed' 
      });
      return { error: response.data.message };
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Network error occurred';
    dispatch({ 
      type: 'auth/registerUser/rejected', 
      payload: errorMessage 
    });
    return { error: errorMessage };
  }
}