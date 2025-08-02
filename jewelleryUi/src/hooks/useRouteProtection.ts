import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useAdminRouteGuard } from './useAdminRouteGuard';

interface RouteConfig {
  path: string;
  allowedRoles: ('Admin' | 'User')[];
  redirectTo?: string;
}

const routeConfigs: RouteConfig[] = [
  {
    path: '/admin',
    allowedRoles: ['Admin'],
    redirectTo: '/products'
  },
  {
    path: '/user/orders',
    allowedRoles: ['User'],
    redirectTo: '/products'
  },
  {
    path: '/addresses',
    allowedRoles: ['User'],
    redirectTo: '/products'
  }
];

export const useRouteProtection = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use admin route guard
  useAdminRouteGuard();

  useEffect(() => {
    if (!isAuthenticated) {
      return; // Let other auth logic handle unauthenticated users
    }

    const currentPath = location.pathname;
    const userRole = user?.role || 'User';
    
    // Find route config for current path
    const routeConfig = routeConfigs.find(config => 
      currentPath.startsWith(config.path)
    );

    if (routeConfig && !routeConfig.allowedRoles.includes(userRole)) {
      // User doesn't have permission for this route
      console.log(`Access denied: User role "${userRole}" cannot access "${currentPath}"`);
      
      // Determine redirect destination
      const redirectTo = routeConfig.redirectTo || (userRole === 'Admin' ? '/admin' : '/products');
      
      // Replace current history entry to prevent back button issues
      navigate(redirectTo, { replace: true });
    }
  }, [location.pathname, user?.role, isAuthenticated, navigate]);

  return {
    isAuthorized: (requiredRoles: ('Admin' | 'User')[]) => {
      if (!isAuthenticated) return false;
      const userRole = user?.role || 'User';
      return requiredRoles.includes(userRole);
    },
    userRole: user?.role || 'User'
  };
};