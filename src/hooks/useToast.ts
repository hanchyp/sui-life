import { useState, useCallback } from 'react';
import { Toast, ToastType } from '@/components/Toast';

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = { id, message, type };
    
    setToasts((prev) => [...prev, newToast]);
    
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message: string) => {
    return showToast(message, 'success');
  }, [showToast]);

  const showError = useCallback((message: string) => {
    return showToast(message, 'error');
  }, [showToast]);

  const showInfo = useCallback((message: string) => {
    return showToast(message, 'info');
  }, [showToast]);

  return {
    toasts,
    showToast,
    showSuccess,
    showError,
    showInfo,
    removeToast
  };
};

