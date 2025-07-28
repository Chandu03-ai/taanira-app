import React from 'react';
import { useRouteProtection } from '../../hooks/useRouteProtection';

interface RouteGuardProps {
  children: React.ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  useRouteProtection();
  return <>{children}</>;
};

export default RouteGuard;