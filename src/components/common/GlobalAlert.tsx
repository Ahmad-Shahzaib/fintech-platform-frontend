import React, { createContext, useContext, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

type AlertType = 'success' | 'error' | 'info' | 'warning';

interface AlertContextValue {
  showAlert: (message: string, type?: AlertType) => void;
}

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertType>('info');

  const showAlert = (msg: string, type: AlertType = 'info') => {
    setMessage(msg);
    setSeverity(type);
    setOpen(true);
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      // ignore in SSR environments
    }
  };

  // On mount, check sessionStorage for a pending alert (survives reloads)
  React.useEffect(() => {
    try {
      const raw = sessionStorage.getItem('globalAlert');
      if (raw) {
        const parsed = JSON.parse(raw) as { message: string; type?: AlertType };
        if (parsed?.message) {
          showAlert(parsed.message, parsed.type || 'info');
        }
        sessionStorage.removeItem('globalAlert');
      }
    } catch (e) {
      // ignore JSON parse errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ zIndex: 14000, top: '5rem !important', right: '0rem !important' }}
      >
          <Alert onClose={handleClose} severity={severity} sx={{ width: 'auto', minWidth: 300, maxWidth: 420, textAlign: 'left', backgroundColor: '#54ab64ff', color: 'white' }}>
          {message}
        </Alert>
      </Snackbar>
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlert must be used within AlertProvider');
  return ctx;
};

export default AlertContext;
