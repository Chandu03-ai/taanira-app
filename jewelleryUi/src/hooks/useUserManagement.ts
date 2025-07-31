import { useState, useEffect } from 'react';
import { User } from '../types';
import { NotificationState, TrackingResponse } from '../types/admin';
import { UserStats,  } from '../types/dashboard';
import { adminService } from '../services/adminService';

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingLoading, setTrackingLoading] = useState<string | null>(null);
  const [userOrderCounts, setUserOrderCounts] = useState<Record<string, number>>({});
  const [notification, setNotification] = useState<NotificationState>({
    message: '',
    type: 'info',
    isVisible: false
  });

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setNotification({
      message,
      type,
      isVisible: true
    });
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllUsers();
      setUsers(response.result || []);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
      showNotification('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const sendTrackingId = async (userId: string, trackingNumber: string, orderId: string) => {
    try {
      setTrackingLoading(userId);
      const result = await adminService.sendTrackingId(trackingNumber, orderId);

      
      if (result.code === 10000) {
        const trackingData: TrackingResponse = result.result;
        showNotification('Tracking ID sent successfully!', 'success');
        
        if (trackingData.delivered) {
          await fetchUserOrderCount(userId);
        }
      } else {
        throw new Error(result.message || 'Failed to send tracking ID');
      }
    } catch (error) {
      console.error('Error sending tracking ID:', error);
      showNotification('Failed to send tracking ID', 'error');
    } finally {
      setTrackingLoading(null);
    }
  };

  const fetchUserOrderCount = async (userId: string) => {
    try {
      const response = await adminService.getUserOrderCount(userId);
      if (response.code === 10000) {
        setUserOrderCounts(prev => ({
          ...prev,
          [userId]: response.result.totalProducts || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching user order count:', error);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      await loadUsers();
      showNotification('User role updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating user role:', error);
      showNotification('Failed to update user role', 'error');
    }
  };

  const getUserStats = () => ({
    total: users.length,
    admins: users.filter(u => u.role === 'Admin').length,
    users: users.filter(u => u.role === 'User' || !u.role).length
  });

  useEffect(() => {
    loadUsers();
  }, []);

  return {
    users,
    loading,
    trackingLoading,
    userOrderCounts,
    notification,
    showNotification,
    setNotification,
    loadUsers,
    sendTrackingId,
    updateUserRole,
    getUserStats,
  };
};