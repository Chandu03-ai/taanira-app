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
    <div className="fixed inset-0 z-50 bg-theme-dark bg-opacity-50 flex items-center justify-center">
      <div className="bg-theme-light w-[90%] max-w-md p-6 rounded-xl shadow-xl relative">
        <button
          onClick={onClose}
          className={`absolute top-3 right-3 text-theme-muted hover:text-theme-primary ${baseFocusClasses}`}
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold mb-3 text-theme-primary">Login Required</h2>
        <p className="text-sm text-theme-muted mb-6">Please login to continue with your cart and checkout.</p>
        <button
          onClick={handleLogin}
          className={`w-full bg-theme-primary text-theme-light py-2 rounded-lg hover:bg-theme-dark transition ${baseFocusClasses}`}
        >
          Login to Buy
        </button>
      </div>
    </div>,
    document.body
  );
};

export default LoginPromptModal;
