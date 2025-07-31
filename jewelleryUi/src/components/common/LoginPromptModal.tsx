// components/LoginPromptModal.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import { useLocation } from 'react-router-dom';
import { X } from 'lucide-react';

interface Props {
  show: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const LoginPromptModal: React.FC<Props> = ({ show, onClose, onLogin }) => {
  if (!show) return null;
  const location = useLocation();
  const baseFocusClasses = "focus:outline-none focus:ring-0";

  const handleLogin = () => {
    // Pass current location to login for post-login redirect
    onLogin();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 bg-theme-dark bg-opacity-50 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-theme-light w-full max-w-sm sm:max-w-md p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-xl relative">
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 sm:top-6 sm:right-6 text-theme-muted hover:text-theme-primary p-2 rounded-lg hover:bg-theme-surface transition-colors ${baseFocusClasses}`}
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold italic mb-3 sm:mb-4 text-theme-primary">
            Login Required
          </h2>
          <p className="text-sm sm:text-base text-theme-muted mb-6 sm:mb-8 font-serif italic leading-relaxed">
            Please login to continue with your cart and checkout.
          </p>
        <button
          onClick={handleLogin}
          className={`w-full bg-theme-primary text-theme-light py-3 sm:py-4 rounded-lg sm:rounded-xl hover:bg-theme-dark transition-all duration-200 ease-in-out font-serif font-semibold italic text-sm sm:text-base ${baseFocusClasses}`}
        >
          Login to Buy
        </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LoginPromptModal;
