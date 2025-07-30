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
    
    let menuItems = [];
    
    if (userRole === 'Admin') {
      // Admin menu items
      const adminItems = [
        { label: 'Profile', path: '/profile' },
        { label: 'Shop', path: '/products' },
        { label: 'Admin Panel', path: '/admin' },
      ];
      
      // Filter out current page
      menuItems = adminItems.filter(item => currentPath !== item.path);
    } else {
      // User menu items
      const userItems = [
        { label: 'Profile', path: '/profile' },
        { label: 'Shop', path: '/products' },
        { label: 'Orders', path: '/user/orders' },
        { label: 'Addresses', path: '/addresses' },
      ];
      
      // Filter out current page
      menuItems = userItems.filter(item => currentPath !== item.path);
    }
    
    return menuItems;
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
        className={`flex items-center text-xs sm:text-sm lg:text-sm tracking-widest hover:opacity-70 transition-all duration-200 ease-in-out h-8 sm:h-10 lg:h-12 min-w-0 font-serif italic ${baseFocusClasses}`}
        style={{ color: styles.textColor, fontWeight: styles.fontWeight }}
        title="Login to your account"
      >
        <span className="hidden sm:inline">LOGIN</span>
        <UserCircle className="h-6 w-6 sm:hidden" />
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={`flex items-center space-x-1 sm:space-x-2 hover:opacity-70 transition-all duration-200 ease-in-out h-8 sm:h-10 lg:h-12 ${baseFocusClasses} active:outline-none active:ring-0 border-none min-w-0 font-serif italic`}
        style={{ color: styles.textColor, fontWeight: styles.fontWeight }}
        title={`${user?.firstname || 'User'} Menu`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls="user-menu-dropdown"
      >
        {isAdmin && <UserCircle className="h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0" />}
        <span className="text-xs sm:text-sm lg:text-sm tracking-widest truncate max-w-[80px] sm:max-w-none">
          {user?.username?.toUpperCase() || 'USER'}
        </span>
        {isOpen ? (
          <ChevronUp
            className="h-3 w-3 sm:h-4 sm:w-4 transition-all duration-200 ease-in-out flex-shrink-0"
            color={styles.textColor}
          />
        ) : (
          <ChevronDown
            className="h-3 w-3 sm:h-4 sm:w-4 transition-all duration-200 ease-in-out flex-shrink-0"
            color={styles.textColor}
          />
        )}

      </button>


      {isOpen && (
        <div
          id="user-menu-dropdown"
          className={`absolute ${dropdownPosition === 'top' ? 'bottom-full mb-2' : 'mt-2'
            } right-0 w-44 xs:w-[calc(100vw-2rem)] sm:w-48 lg:w-52 bg-theme-light rounded-2xl shadow-xl border border-theme-surface py-2 z-50 min-w-max`}
        >
          <div className="px-3 sm:px-4 py-2 sm:py-3 text-sm text-theme-primary border-b border-theme-surface font-serif">
            <div className="font-semibold italic truncate">{user?.firstname} {user?.lastname}</div>
            <div className="text-xs text-theme-muted/70 font-light truncate mt-1">{user?.email}</div>
          </div>
          
          {/* Dynamic menu items based on role and current route */}
          {getMenuItems().map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-3 sm:px-4 py-2 text-sm font-serif italic text-theme-primary hover:bg-theme-surface transition-all duration-200 ease-in-out ${baseFocusClasses}`}
              title={item.label}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          
          <div className="border-t border-theme-surface my-1 mx-2"></div>
          
          <button
            onClick={handleLogout}
            className={`block w-full text-left px-3 sm:px-4 py-2 text-sm font-serif italic text-theme-primary hover:bg-theme-surface transition-all duration-200 ease-in-out ${baseFocusClasses}`}
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
