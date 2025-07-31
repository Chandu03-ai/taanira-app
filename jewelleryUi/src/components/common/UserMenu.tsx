import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, UserCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import LogoutButton from './LogoutButton';

interface UserMenuProps {
  dropdownPosition?: 'top' | 'bottom';
}

const UserMenu: React.FC<UserMenuProps> = ({ dropdownPosition = 'bottom' }) => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === 'Admin';
  const baseFocusClasses = "focus:outline-none focus:ring-0";

  const styles = {
    textColor: isHomePage ? '#FFFFFF' : 'var(--color-theme-primary)',
    fontWeight: '700',
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Define menu items based on user role
const getMenuItems = () => {
  const currentPath = location.pathname;
  const userRole = user?.role || 'User';

  // Show only "Profile" for Admin
  if (userRole === 'Admin') {
    return currentPath !== '/profile' ? [{ label: 'Profile', path: '/profile' }] : [];
  }

  // Normal user menu
  const userItems = [
    { label: 'Profile', path: '/profile' },
    { label: 'Shop', path: '/products' },
    { label: 'Orders', path: '/user/orders' },
    { label: 'Addresses', path: '/addresses' },
  ];
  return userItems.filter(item => currentPath !== item.path);
};


  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  if (!isAuthenticated) {
    return (
      <Link
        to="/login"
        state={{ from: location }}
        className={`flex items-center text-xs sm:text-sm tracking-widest hover:opacity-70 transition-all duration-200 ease-in-out p-2 min-w-0 font-serif italic ${baseFocusClasses}`}
        style={{ color: styles.textColor, fontWeight: styles.fontWeight }}
        title="Login to your account"
      >
        <span className="hidden md:inline">LOGIN</span>
        <UserCircle className="h-5 w-5 md:hidden" />
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={`flex items-center space-x-1 sm:space-x-2 hover:opacity-70 transition-all duration-200 ease-in-out p-2 ${baseFocusClasses} active:outline-none active:ring-0 border-none min-w-0 font-serif italic`}
        style={{ color: styles.textColor, fontWeight: styles.fontWeight }}
        title={`${user?.username || 'User'} Menu`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls="user-menu-dropdown"
      >
        {isAdmin && <UserCircle className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />}
        <span className="text-xs sm:text-sm tracking-widest truncate max-w-[60px] sm:max-w-[80px] md:max-w-none">
          {user?.username || 'USER'}
        </span>
        {isOpen ? (
          <ChevronUp
            className="h-4 w-4 transition-all duration-200 ease-in-out flex-shrink-0"
            color={styles.textColor}
          />
        ) : (
          <ChevronDown
            className="h-4 w-4 transition-all duration-200 ease-in-out flex-shrink-0"
            color={styles.textColor}
          />
        )}

      </button>


      {isOpen && (
        <div
          id="user-menu-dropdown"
          className={`absolute ${dropdownPosition === 'top' ? 'bottom-full mb-2' : 'mt-2'
            } right-0 w-48 sm:w-52 bg-theme-light rounded-xl shadow-xl border border-theme-surface py-2 z-50 min-w-max`}
        >
          <div className="px-4 py-3 text-sm text-theme-primary border-b border-theme-surface font-serif">
            <div className="font-medium truncate">{user?.username}</div>
            <div className="text-xs text-theme-muted/70 font-light truncate mt-1">{user?.email}</div>
          </div>
          
          {/* Dynamic menu items based on role and current route */}
          {getMenuItems().map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-4 py-3 text-sm font-serif italic text-theme-primary hover:bg-theme-surface transition-all duration-200 ease-in-out ${baseFocusClasses}`}
              title={item.label}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          
          <div className="border-t border-theme-surface my-2"></div>
          
          <button
            onClick={handleLogout}
            className={`block w-full text-left px-4 py-3 text-sm font-serif italic text-theme-primary hover:bg-theme-surface transition-all duration-200 ease-in-out ${baseFocusClasses}`}
            title="Logout from account"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
