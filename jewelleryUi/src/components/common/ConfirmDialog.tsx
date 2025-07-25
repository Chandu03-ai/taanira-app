import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Dialog from './Dialog';
import { ReactNode } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  loading = false
}) => {
  const typeStyles = {
    danger: {
      icon: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700'
    },
    warning: {
      icon: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700'
    },
    info: {
      icon: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700'
    }
  };

  const styles = typeStyles[type];

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-6 font-serif text-rich-brown">
        <div className="flex items-center gap-4">
          <AlertTriangle className="h-6 w-6 text-mocha" />
          <div className="text-base font-light italic">{message}</div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-subtle-beige text-rich-brown rounded-xl font-serif font-semibold italic hover:bg-rose-sand transition-all duration-200 ease-in-out shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-serif font-semibold italic hover:bg-red-700 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Dialog>
  );

};

export default ConfirmDialog;