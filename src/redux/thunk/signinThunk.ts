// @/redux/thunk/signinThunk.ts

import api from '@/lib/axios';
import { AppDispatch } from '@/redux/store';

interface SigninData {
    email: string;
    password: string;
}
export const signinUser = (userData: SigninData) => async (dispatch: AppDispatch) => {
    try {
        dispatch({ type: 'auth/signinUser/pending' });

        // STEP 1: Get the CSRF cookie from the backend.
        // This is a required step for Laravel Sanctum web authentication.
        // The backend will set an 'XSRF-TOKEN' cookie.
        await api.get('/login');

        // STEP 2: Now that we have the CSRF cookie, make the login request.
        // The axios interceptor will automatically attach the token to the headers.
        const response = await api.post('/login', userData);

        if (response.data.message === "Login successful") {
            const { user, token } = response.data.data;

            // Store the Bearer token in localStorage for subsequent requests
            localStorage.setItem('authToken', token);

            // The axios interceptor will now automatically attach this token
            // to all future requests, so this line is technically redundant
            // but good for clarity. The interceptor handles it.
            // api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            dispatch({
                type: 'auth/signinUser/fulfilled',
                payload: { user, token }
            });

            return { success: true };
        } else {
            // Handle cases where login fails but isn't a 4xx/5xx error
            dispatch({
                type: 'auth/signinUser/rejected',
                payload: response.data.message || 'Login failed'
            });
            return { success: false, error: response.data.message };
        }
    } catch (error: any) {
        // This will catch network errors or 4xx/5xx responses (like 401 Unauthorized or 419 CSRF mismatch)
        const errorMessage = error.response?.data?.message || error.message || 'Network error occurred';
        dispatch({
            type: 'auth/signinUser/rejected',
            payload: errorMessage
        });
        return { success: false, error: errorMessage };
    }
};