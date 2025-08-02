import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Routes that admins should NOT be able to access
const RESTRICTED_ROUTES_FOR_ADMIN = [
  '/',
  '/products',
  '/product',
  '/category',
  '/cart',
  '/profile',
  '/user/orders',
  '/addresses',
  '/order-confirmation',
  '/login',
  '/register',
  '/forgot-password',
  '/verify-reset'
];

// Routes that admins CAN access
const ALLOWED_ROUTES_FOR_ADMIN = [
  '/admin',
  '/privacy',
  '/terms',
  '/sitemap'
];

export const useAdminRouteGuard = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const isAdmin = user.role === 'Admin';
    const currentPath = location.pathname;

    if (isAdmin) {
      // Check if admin is trying to access restricted routes
      const isRestrictedRoute = RESTRICTED_ROUTES_FOR_ADMIN.some(route => {
        if (route === '/product' || route === '/category') {
          // Handle dynamic routes like /product/:slug or /category/:category
          return currentPath.startsWith(route + '/');
        }
        return currentPath === route || currentPath.startsWith(route + '/');
      });

      const isAllowedRoute = ALLOWED_ROUTES_FOR_ADMIN.some(route => 
        currentPath === route || currentPath.startsWith(route + '/')
      );

      if (isRestrictedRoute && !isAllowedRoute) {
        console.log(`Admin access denied to ${currentPath}, redirecting to /admin`);
        navigate('/admin', { replace: true });
      }
    }
  }, [isAuthenticated, user, location.pathname, navigate]);

  return {
    isAdminRestricted: (path: string) => {
      if (!user || user.role !== 'Admin') return false;
      
      return RESTRICTED_ROUTES_FOR_ADMIN.some(route => {
        if (route === '/product' || route === '/category') {
          return path.startsWith(route + '/');
        }
        return path === route || path.startsWith(route + '/');
      });
    }
  };
};