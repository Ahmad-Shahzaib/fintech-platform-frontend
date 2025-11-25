// app/Providers.tsx
'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { SidebarProvider } from '@/context/SidebarContext';
import ReduxProvider from '@/redux/Provider';
import KycModalLauncher from '@/components/kyc-form/KycModalLauncher';

// Use default export
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <ThemeProvider>
        <AuthProvider>
          <SidebarProvider>
            {children}
            <KycModalLauncher />
          </SidebarProvider>
        </AuthProvider>
      </ThemeProvider>
    </ReduxProvider>
  );
}