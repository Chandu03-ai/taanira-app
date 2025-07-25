import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const LogoutButton: React.FC = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <button
      onClick={handleLogout}
      className="block w-full text-left px-3 sm:px-4 py-2 text-sm font-serif italic text-rich-brown hover:bg-subtle-beige transition-all duration-200 ease-in-out"
      title="Logout from account"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
