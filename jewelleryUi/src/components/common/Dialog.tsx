import React from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md'
}) => {
  if (!isOpen) return null;
  const baseFocusClasses = "focus:outline-none focus:ring-0";

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  };

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-theme-primary/10 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      onClick={handleBackdropClick}
    >


      <div className={`bg-theme-light rounded-2xl shadow-2xl border border-theme-surface w-full ${maxWidthClasses[maxWidth]} sm:mx-0 mx-2 max-h-[90vh] transform transition-all flex flex-col overflow-hidden`}>

        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-theme-surface flex-shrink-0">
          <h2 className="text-xl font-serif font-semibold italic text-theme-primary">{title}</h2>
          <button
            onClick={onClose}
            className={`text-theme-muted hover:text-theme-primary transition-all duration-200 ease-in-out p-2 rounded-xl hover:bg-theme-surface ${baseFocusClasses}`}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-4 sm:p-6 font-serif text-theme-primary overflow-y-auto flex-grow">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Dialog;
