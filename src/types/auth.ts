// User roles enum
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

// Auth state interface
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Mock users for demonstration (in production, this would come from backend)
export const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'admin@fintech.com': {
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@fintech.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
      avatar: '/images/user/user-01.png',
    },
  },
  'user@fintech.com': {
    password: 'user123',
    user: {
      id: '2',
      email: 'user@fintech.com',
      name: 'Regular User',
      role: UserRole.USER,
      avatar: '/images/user/user-02.png',
    },
  },
};
// In your types file (where TopUpItem is defined)
export interface TopUpItem {
  id: string;
  created_at?: string; // Make optional if it might not exist
  date?: string;      // Add this property
  amount_aud?: string;
  amount?: string | number;
  currency?: string;
  coin?: string;
  network?: string;
  // ... other properties
}