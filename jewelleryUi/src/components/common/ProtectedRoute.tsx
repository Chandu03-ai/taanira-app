import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('Admin' | 'User')[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/shop' 
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      // Not authenticated, redirect to login
      navigate('/login', { replace: true });
      return;
    }

    if (allowedRoles.length > 0) {
      const userRole = user?.role || 'User';
      
      if (!allowedRoles.includes(userRole)) {
        // User doesn't have required role, redirect
        console.log(`Access denied: User role "${userRole}" not in allowed roles [${allowedRoles.join(', ')}]`);
        
        // Show access denied notification
        addNotification({
          message: 'Access denied. You do not have permission to view this page.',
          type: 'error',
          duration: 4000
        });
        
        // Redirect based on user role
        const destination = userRole === 'Admin' ? '/admin' : redirectTo;
        navigate(destination, { replace: true });
        return;
      }
    }
  }, [isAuthenticated, user, allowedRoles, navigate, redirectTo, location.pathname, addNotification]);

  // Don't render children if user is not authenticated or doesn't have proper role
  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles.length > 0) {
    const userRole = user?.role || 'User';
    if (!allowedRoles.includes(userRole)) {
      return null;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;