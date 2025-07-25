import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCategoryStore } from '../../store/categoryStore';
import { useCartStore } from '../../store/cartStore';
import SEOHead from '../seo/SEOHead';
import { SITE_CONFIG } from '../../constants/siteConfig';
import Taanira from '../../assets/Taanira-logo.png';
import CartSidebar from './CartSidebar';
import UserMenu from './UserMenu';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [showText, setShowText] = useState(false);

  const { user, isAuthenticated, logout } = useAuthStore();
  const { loadCategories } = useCategoryStore();
  const { getUniqueItemCount } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === '/';
  const isAdminPage = location.pathname.startsWith('/admin');

  const cartItemCount = getUniqueItemCount();

  useEffect(() => {
    loadCategories().catch(console.error);
  }, [loadCategories]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 50);
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const timer = setTimeout(() => setShowText(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const styles = {
    background: 'transparent',
    textColor: isHomePage ? '#FFFFFF' : '#4A3F36',
    fontWeight: scrolled ? '500' : '700',
    borderColor: '#DEC9A3',
  };

  return (
    <>
      <SEOHead />
      {!isAdminPage && (
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{
          backgroundColor: styles.background,
          borderColor: 'transparent',
          borderBottomWidth: '0px',
        }}
      >
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
          <div className="grid grid-cols-3 items-center h-8 sm:h-10 lg:h-12 gap-2 sm:gap-4">
            {/* Left */}
            <div className="flex items-center justify-start">
              <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-6">
                <button
                  onClick={() => setIsMenuOpen(true)}
                  style={{ color: styles.textColor, fontWeight: styles.fontWeight }}
                  className={`hover:opacity-70 transition-opacity flex items-center ${
                    showText ? 'opacity-100 animate-fadeInSlow' : 'opacity-0'
                  }`}
                  title="Open Menu"
                >
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
                <div className="hidden lg:flex items-center space-x-4 xl:space-x-6 text-xs tracking-widest">
                  <Link
                    to="/products"
                    style={{ color: styles.textColor, fontWeight: styles.fontWeight }}
                    className="hover:opacity-70 transition-all duration-200 ease-in-out whitespace-nowrap font-serif italic"
                    title="Shop Products"
                  >
                    SHOP
                  </Link>
                  <Link
                    to="/about"
                    style={{ color: styles.textColor, fontWeight: styles.fontWeight }}
                    className="hover:opacity-70 transition-all duration-200 ease-in-out whitespace-nowrap font-serif italic"
                    title="About Us"
                  >
                    ABOUT
                  </Link>
                </div>
              </div>
            </div>

            {/* Center - Logo */}
            <div className="flex items-center justify-center">
              <Link
                to="/"
                className={`flex items-center justify-center transition-all duration-200 ease-in-out ${
                  showText ? 'opacity-100 animate-fadeInSlow' : 'opacity-0'
                }`}
                title={`${SITE_CONFIG.name} - Home`}
              >
                {isHomePage ? (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 flex items-center justify-center">
                    <img
                      src={Taanira}
                      alt="Logo"
                      className="w-full h-full object-contain transition-all duration-200 ease-in-out"
                      style={{ filter: 'brightness(0) invert(1)' }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-6 sm:h-8 lg:h-10">
                    <span
                      className="text-base sm:text-lg lg:text-xl xl:text-2xl font-serif italic font-semibold tracking-wide whitespace-nowrap"
                      style={{ color: styles.textColor, fontWeight: styles.fontWeight }}
                    >
                      {SITE_CONFIG.shortName}
                    </span>
                  </div>
                )}
              </Link>
            </div>

            {/* Right */}
            <div className="flex items-center justify-end">
              <div
                className={`flex items-center space-x-1 sm:space-x-2 lg:space-x-3 ${
                  showText ? 'opacity-100 animate-fadeInSlow' : 'opacity-0'
                }`}
              >
                <UserMenu />
                <button
                  onClick={() => setShowCartSidebar(true)}
                  className="flex items-center gap-1 sm:gap-2 hover:opacity-70 transition-opacity relative h-8 sm:h-10 lg:h-12 min-w-0"
                  title={`Shopping Cart (${cartItemCount} items)`}
                >
                  <span
                    className="hidden lg:inline text-xs tracking-widest whitespace-nowrap"
                    style={{ color: styles.textColor, fontWeight: styles.fontWeight }}
                  >
                    CART
                  </span>
                  <div className="relative flex items-center">
                    <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" style={{ color: styles.textColor }} />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-[10px] sm:text-xs rounded-full h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 flex items-center justify-center font-medium">
                        {cartItemCount > 99 ? '99+' : cartItemCount}
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      )}

      {/* Sidebar Menu */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-40"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 h-screen w-[280px] sm:w-80 md:w-96 lg:w-[400px] max-w-[90vw] bg-[#1d1a15] z-50 shadow-2xl px-4 sm:px-6 py-6 sm:py-8 flex flex-col justify-between text-[#d4b896] transition-all duration-300 ease-in-out overflow-y-auto">
            <div>
              <div className="flex items-center gap-2 mb-6 sm:mb-8">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-6 h-6 rounded-full border border-[#d4b896] flex items-center justify-center hover:opacity-70 transition-opacity"
                  title="Close Menu"
                >
                  <X className="h-4 w-4 text-[#d4b896]" />
                </button>
                <span className="tracking-widest text-xs">CLOSE</span>
              </div>
              <div className="flex flex-col gap-4 sm:gap-6 text-left pl-2">
                {isAuthenticated ? (
                  <>
                    <Link 
                      to="/profile" 
                      onClick={() => setIsMenuOpen(false)} 
                      className="block text-sm sm:text-base tracking-[0.15em] font-light hover:opacity-80 py-2 transition-opacity"
                      title="View Profile"
                    >
                      PROFILE
                    </Link>
                    <div className="border-t border-[#d4b896]/20" />
                    <Link 
                      to="/products" 
                      onClick={() => setIsMenuOpen(false)} 
                      className="block text-sm sm:text-base tracking-[0.15em] font-light hover:opacity-80 py-2 transition-opacity"
                      title="Shop Products"
                    >
                      SHOP
                    </Link>
                    <div className="border-t border-[#d4b896]/20" />
                    <Link 
                      to="/cart" 
                      onClick={() => setIsMenuOpen(false)} 
                      className="flex items-center justify-between text-sm sm:text-base tracking-[0.15em] font-light hover:opacity-80 py-2 transition-opacity"
                      title={`Shopping Cart (${cartItemCount} items)`}
                    >
                      <span>CART</span>
                      {cartItemCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium ml-2">
                          {cartItemCount > 99 ? '99+' : cartItemCount}
                        </span>
                      )}
                    </Link>
                    <div className="border-t border-[#d4b896]/20" />
                    <Link 
                      to="/addresses" 
                      onClick={() => setIsMenuOpen(false)} 
                      className="block text-sm sm:text-base tracking-[0.15em] font-light hover:opacity-80 py-2 transition-opacity"
                      title="Manage Addresses"
                    >
                      ADDRESSES
                    </Link>
                    <div className="border-t border-[#d4b896]/20" />
                    {user?.role === 'Admin' && (
                      <>
                        <Link 
                          to="/admin" 
                          onClick={() => setIsMenuOpen(false)} 
                          className="block text-sm sm:text-base tracking-[0.15em] font-light hover:opacity-80 py-2 transition-opacity"
                          title="Admin Panel"
                        >
                          ADMIN PANEL
                        </Link>
                        <div className="border-t border-[#d4b896]/20" />
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {['/', '/products', '/about'].map((path) => (
                      <div key={path}>
                        <Link
                          to={path}
                          onClick={() => setIsMenuOpen(false)}
                          className="block text-sm sm:text-base tracking-[0.15em] font-light hover:opacity-80 py-2 transition-opacity"
                          title={path === '/' ? 'Home' : path.replace('/', '').charAt(0).toUpperCase() + path.slice(2)}
                        >
                          {path === '/' ? 'HOME' : path.replace('/', '').toUpperCase()}
                        </Link>
                        <div className="border-t border-[#d4b896]/20" />
                      </div>
                    ))}
                    <Link 
                      to="/cart" 
                      onClick={() => setIsMenuOpen(false)} 
                      className="flex items-center justify-between text-sm sm:text-base tracking-[0.15em] font-light hover:opacity-80 py-2 transition-opacity"
                      title={`Shopping Cart (${cartItemCount} items)`}
                    >
                      <span>CART</span>
                      {cartItemCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium ml-2">
                          {cartItemCount > 99 ? '99+' : cartItemCount}
                        </span>
                      )}
                    </Link>
                    <div className="border-t border-[#d4b896]/20" />
                    <Link 
                      to="/login" 
                      onClick={() => setIsMenuOpen(false)} 
                      className="block text-sm sm:text-base tracking-[0.15em] font-light hover:opacity-80 py-2 transition-opacity"
                      title="Login to Account"
                    >
                      LOGIN
                    </Link>
                  </>
                )}
              </div>
            </div>

            {isAuthenticated && (
              <div className="mt-4 sm:mt-6 text-left pl-2">
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left text-sm sm:text-base tracking-[0.15em] font-light hover:opacity-80 py-2 transition-opacity"
                  title="Logout"
                >
                  LOGOUT
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {showCartSidebar && <CartSidebar onClose={() => setShowCartSidebar(false)} />}
    </>
  );
};

export default Header;