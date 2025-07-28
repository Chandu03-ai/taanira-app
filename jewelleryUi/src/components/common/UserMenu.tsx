import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp, UserCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import LogoutButton from './LogoutButton';

interface UserMenuProps {
  dropdownPosition?: 'top' | 'bottom';
}

const UserMenu: React.FC<UserMenuProps> = ({ dropdownPosition = 'bottom' }) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === 'Admin';

  const styles = {
    textColor: isHomePage ? '#FFFFFF' : '#4A3F36',
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

  if (!isAuthenticated) {
    return (
      <Link
        to="/login"
        className="flex items-center text-xs sm:text-sm lg:text-sm tracking-widest hover:opacity-70 transition-all duration-200 ease-in-out h-8 sm:h-10 lg:h-12 min-w-0 font-serif italic"
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
        className="flex items-center space-x-1 sm:space-x-2 hover:opacity-70 transition-all duration-200 ease-in-out h-8 sm:h-10 lg:h-12 outline-none focus:outline-none focus:ring-0 active:outline-none active:ring-0 border-none min-w-0 font-serif italic"
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
            } right-0 w-44 xs:w-[calc(100vw-2rem)] sm:w-48 lg:w-52 bg-white rounded-2xl shadow-xl border border-subtle-beige py-2 z-50 min-w-max`}
        >
          <div className="px-3 sm:px-4 py-2 sm:py-3 text-sm text-rich-brown border-b border-subtle-beige font-serif">
            <div className="font-semibold italic truncate">{user?.firstname} {user?.lastname}</div>
            <div className="text-xs text-mocha/70 font-light truncate mt-1">{user?.email}</div>
          </div>
          <Link
            to="/profile"
            className="block px-3 sm:px-4 py-2 text-sm font-serif italic text-rich-brown hover:bg-subtle-beige transition-all duration-200 ease-in-out"
            title="View Profile"
          >
            Profile
          </Link>
          {/* Admin Panel link, shown only if user is admin and not on the admin page */}
          {isAdmin && location.pathname !== '/admin' && (
            <Link
              to="/admin"
              className="block px-3 sm:px-4 py-2 text-sm font-serif italic text-rich-brown hover:bg-subtle-beige transition-all duration-200 ease-in-out"
              title="Admin Panel"
            >
              Admin Panel
            </Link>
          )}
          {/* Shop link - updated styling for consistency */}
          <Link
            to="/products"
            className="block px-3 sm:px-4 py-2 text-sm font-serif italic text-rich-brown hover:bg-subtle-beige transition-all duration-200 ease-in-out"
            title="View Shopping Products"
          >
            Shop
          </Link>
          {!isAdmin && (
            <>
              <Link
                to="/user/orders"
                className="block px-3 sm:px-4 py-2 text-sm font-serif italic text-rich-brown hover:bg-subtle-beige transition-all duration-200 ease-in-out"
                title="View Shopping Products"
              >
                order
              </Link>
              <Link
                to="/addresses"
                className="block px-3 sm:px-4 py-2 text-sm font-serif italic text-rich-brown hover:bg-subtle-beige transition-all duration-200 ease-in-out"
                title="View Shopping Products"
              >
                addresses
              </Link>
            </>
          )}
          <div className="border-t border-gray-100 my-1 mx-2"></div>
          <LogoutButton />
        </div>
      )}
    </div>
  );
};

export default UserMenu;
