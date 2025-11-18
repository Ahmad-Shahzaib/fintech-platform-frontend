# Role-Based Authentication System

## Overview
This project implements a production-level role-based authentication system with two user types: Admin and User.

## Demo Credentials

### Admin User
- **Email:** admin@fintech.com
- **Password:** admin123
- **Access:** Full admin dashboard and all admin features

### Regular User
- **Email:** user@fintech.com
- **Password:** user123
- **Access:** User dashboard at `/dashboard` and limited features

## Features

### 1. Authentication Context
- Centralized authentication state management
- Secure login/logout functionality
- Persistent session using localStorage
- Automatic role-based redirection

### 2. Role-Based Access Control (RBAC)
- **Admin Role:** Access to admin dashboard at `/` and all admin routes under `(admin)` group
- **User Role:** Access to user dashboard at `/dashboard` and user-specific routes under `(user)` group

### 3. Protected Routes
- `ProtectedRoute` component for role-based route protection
- `PublicRoute` component for auth pages (signin/signup)
- Automatic redirection based on user role
- Loading states during authentication checks

### 4. User Interface
- **Separate Sidebars:** 
  - `AppSidebar` for admin users
  - `UserSidebar` for regular users
- **User Dropdown:** Displays current user info and role badge
- **Secure Logout:** Clears session and redirects to signin

## File Structure

```
src/
├── types/
│   └── auth.ts                 # Auth types, User interface, MOCK_USERS
├── context/
│   └── AuthContext.tsx         # Authentication context provider
├── components/
│   └── auth/
│       ├── ProtectedRoute.tsx  # Role-based route protection
│       ├── PublicRoute.tsx     # Public route wrapper
│       └── SignInForm.tsx      # Login form with validation
├── layout/
│   ├── AppSidebar.tsx          # Admin sidebar
│   └── UserSidebar.tsx         # User sidebar
├── app/
│   ├── layout.tsx              # Root layout with AuthProvider
│   ├── (admin)/                # Admin routes (protected)
│   │   └── layout.tsx          # Admin layout with role check
│   ├── (user)/                 # User routes (protected)
│   │   ├── layout.tsx          # User layout with role check
│   │   └── dashboard/
│   │       └── page.tsx        # User dashboard
│   └── (full-width-pages)/
│       └── (auth)/
│           ├── layout.tsx      # Auth layout with PublicRoute
│           └── signin/
│               └── page.tsx    # Signin page
```

## How It Works

### 1. Login Flow
1. User enters credentials on signin page
2. `AuthContext.login()` validates credentials against `MOCK_USERS`
3. On success, user data and token stored in localStorage
4. User redirected based on role:
   - Admin → `/` (admin dashboard)
   - User → `/dashboard` (user dashboard)

### 2. Route Protection
- **Admin Routes:** Wrapped with `ProtectedRoute` allowing only `UserRole.ADMIN`
- **User Routes:** Wrapped with `ProtectedRoute` allowing only `UserRole.USER`
- **Auth Pages:** Wrapped with `PublicRoute` to prevent authenticated users from accessing

### 3. Session Management
- Authentication state persists across page refreshes
- Token stored in localStorage with user data
- `checkAuth()` runs on app initialization

### 4. Logout Flow
1. User clicks logout in UserDropdown
2. `AuthContext.logout()` clears localStorage
3. User redirected to `/signin`

## Production Considerations

### Current Implementation (Demo)
- User credentials stored in `MOCK_USERS` object
- Passwords stored in plain text (demo only)
- Token generated with btoa (base64) encoding
- No backend API integration

### Production Recommendations

#### 1. Backend Integration
Replace mock authentication with real API calls:
```typescript
const login = async (credentials: LoginCredentials) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  
  const data = await response.json();
  // Handle JWT token, refresh tokens, etc.
};
```

#### 2. Security Enhancements
- Use JWT tokens with expiration
- Implement refresh token mechanism
- Use httpOnly cookies for token storage
- Add CSRF protection
- Implement rate limiting
- Use bcrypt/argon2 for password hashing on backend

#### 3. Token Management
```typescript
// Store tokens securely
localStorage.setItem('access_token', data.accessToken);
// httpOnly cookie for refresh token
document.cookie = `refresh_token=${data.refreshToken}; Secure; HttpOnly; SameSite=Strict`;
```

#### 4. API Authorization
Add token to API requests:
```typescript
const authHeaders = {
  'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
};
```

#### 5. Server-Side Route Protection
Implement Next.js middleware for server-side route protection:
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token');
  // Verify token and check user role
  // Redirect if unauthorized
}
```

#### 6. Additional Features
- Two-factor authentication (2FA)
- Password reset functionality
- Email verification
- Session timeout warnings
- Audit logging
- Permission-based access (beyond just roles)

## Environment Variables

For production, add these to `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://api.yourapp.com
NEXT_PUBLIC_AUTH_ENDPOINT=/api/auth
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d
```

## Testing

### Manual Testing
1. Navigate to `/signin`
2. Login with admin credentials → Should redirect to `/`
3. Access admin features
4. Logout
5. Login with user credentials → Should redirect to `/dashboard`
6. Try accessing admin routes → Should redirect to user dashboard
7. Logout and try accessing protected routes → Should redirect to signin

### Automated Testing (Recommended)
```typescript
// Example test with Jest/React Testing Library
describe('Authentication', () => {
  it('should redirect admin to admin dashboard', async () => {
    // Test implementation
  });
  
  it('should redirect user to user dashboard', async () => {
    // Test implementation
  });
  
  it('should prevent unauthorized access', async () => {
    // Test implementation
  });
});
```

## Common Issues

### Issue: User redirected to signin on refresh
**Solution:** Check if `checkAuth()` is properly called in `AuthContext` useEffect

### Issue: Protected routes not working
**Solution:** Ensure `AuthProvider` wraps your app in root layout

### Issue: Role checking fails
**Solution:** Verify user object has correct `role` property matching `UserRole` enum

## Future Enhancements
- [ ] Integrate with backend API
- [ ] Add JWT token management
- [ ] Implement refresh token rotation
- [ ] Add social authentication (Google, GitHub)
- [ ] Implement permission-based access control
- [ ] Add activity logging
- [ ] Implement session management dashboard
- [ ] Add multi-factor authentication

## License
MIT
