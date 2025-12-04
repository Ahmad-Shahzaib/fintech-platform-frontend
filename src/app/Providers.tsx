// app/Providers.tsx
'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { SidebarProvider } from '@/context/SidebarContext';
import ReduxProvider from '@/redux/Provider';
import KycModalLauncher from '@/components/kyc-form/KycModalLauncher';
import { AlertProvider } from '@/components/common/GlobalAlert';

// Use default export
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <ThemeProvider>
        <AuthProvider>
          <SidebarProvider>
            <AlertProvider>
              {children}
              <KycModalLauncher />
            </AlertProvider>
          </SidebarProvider>
        </AuthProvider>
      </ThemeProvider>
    </ReduxProvider>
  );
}