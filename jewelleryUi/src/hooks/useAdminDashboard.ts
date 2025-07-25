import { useState, useEffect } from 'react';
import { DashboardStats } from '../types/dashboard';
import { Product } from '../types';
import { adminService } from '../services/adminService';
import { apiService } from '../services/api';

export const useAdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashboardStats, products] = await Promise.all([
        adminService.getDashboardStats(),
        apiService.getProducts(),
      ]);

      setStats(dashboardStats.result);
      setRecentProducts((products || []).slice(0, 10));
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return {
    stats,
    recentProducts,
    loading,
    error,
    refetch: loadDashboardData,
  };
};