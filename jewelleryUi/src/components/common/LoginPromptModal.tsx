// components/LoginPromptModal.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';

interface Props {
  show: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const LoginPromptModal: React.FC<Props> = ({ show, onClose, onLogin }) => {
  if (!show) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white w-[90%] max-w-md p-6 rounded-xl shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-black"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold mb-3 text-gray-800">Login Required</h2>
        <p className="text-sm text-gray-600 mb-6">Please login to continue with your cart and checkout.</p>
        <button
          onClick={onLogin}
          className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
        >
          Login to Buy
        </button>
      </div>
    </div>,
    document.body
  );
};

export default LoginPromptModal;
