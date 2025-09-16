"use client";

import { Toaster, ToastBar, toast } from 'react-hot-toast';

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#111827', // gray-900
          color: '#ffffff'
        },
        success: {
          iconTheme: {
            primary: '#FDC700', // brand yellow
            secondary: '#111827'
          }
        },
        error: {
          iconTheme: {
            primary: '#EF4444', // red-500
            secondary: '#111827'
          }
        }
      }}
    >
      {(t) => (
        <ToastBar toast={t} style={{
          ...t.style,
          borderRadius: 8,
          border: '1px solid rgba(253,199,0,0.25)'
        }} />
      )}
    </Toaster>
  );
}

export function showSuccess(message: string) {
  toast.success(message, {
    style: { background: '#111827', color: '#fff' }
  });
}

export function showError(message: string) {
  toast.error(message, {
    style: { background: '#111827', color: '#fff' }
  });
}




