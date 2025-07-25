import React, { useState, useEffect } from 'react';
import {
  Package, Truck, CheckCircle, Clock, Eye, Download,
  ChevronUp, ChevronDown, Copy, Check
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { SITE_CONFIG, staticImageBaseUrl } from '../constants/siteConfig';
import { Order } from '../types';
import { formatReadableDate } from '../utils/dateUtils';

const UserOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { isAuthenticated } = useAuthStore();
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) loadOrders();
  }, [isAuthenticated]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserOrders();
      setOrders(response || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (trackingNumber: string | null, orderId: string) => {
    if (trackingNumber) {
      navigator.clipboard.writeText(trackingNumber);
      setCopiedOrderId(orderId);
      setTimeout(() => setCopiedOrderId(null), 3000);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'created':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'attempted':
        return <Truck className="w-4 h-4 text-orange-500" />;
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'created':
        return 'bg-yellow-100 text-yellow-800';
      case 'attempted':
        return 'bg-orange-100 text-orange-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex items-center justify-center">
        <div className="text-center space-y-2">
          <Package className="h-12 w-12 text-gray-400 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-800">Please Log In</h2>
          <p className="text-gray-500 text-sm">Login to view your orders.</p>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner message="Loading your orders..." />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Orders</h1>
        <p className="text-sm text-gray-500 mb-6">View all your purchases and their statuses</p>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <Package className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-800 font-medium">No orders placed yet</p>
            <p className="text-sm text-gray-500 mb-4">Start shopping to place your first order.</p>
            <a href="/products" className="bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition">
              Browse Products
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
<div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-xl shadow-sm p-5 px-4 sm:px-5 transition hover:shadow-md">
                <div className="flex flex-col sm:flex-col md:flex-row md:justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Order ID:</p>
                    <p className="text-sm font-medium text-gray-900">#{order.id.slice(-8)}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {order.trackingNumber && (
                      <>
                        <p className="text-sm text-gray-500">Tracking:</p>
                        <span className="text-sm text-green-600 font-medium">{order.trackingNumber}</span>
                        <button
                          onClick={() => handleCopy(order.trackingNumber, order.id)}
                          className="flex items-center text-xs text-gray-500 hover:text-gray-700"
                        >
                          {copiedOrderId === order.id ? (
                            <>
                              <Check className="w-4 h-4 mr-1" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-1" /> Copy
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap justify-between md:justify-end items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-700 border-t border-gray-100 pt-4">
                  <div>
                    <p className="text-gray-500">Placed On</p>
                    <p>{formatReadableDate(order.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Amount</p>
                    <p>{SITE_CONFIG.currencySymbol}{(order.amount / 100).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Items</p>
                    <p>{order.items.length}</p>
                  </div>
                  <div className="text-right sm:text-left">
                    <button
                      onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                      className="flex items-center gap-1 text-purple-600 text-sm hover:text-purple-800"
                    >
                      <Eye className="w-4 h-4" />
                      {selectedOrder?.id === order.id ? (
                        <>
                          <ChevronUp className="w-4 h-4" /> Hide Details
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" /> View Details
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {selectedOrder?.id === order.id && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Order Items</h4>
                    <div className="space-y-3">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <img src={staticImageBaseUrl + item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-sm font-medium text-gray-800">
                            {SITE_CONFIG.currencySymbol}{item.price.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex gap-4 flex-wrap text-xs text-purple-600">
                      <button className="flex items-center gap-1 hover:underline">
                        <Download className="w-4 h-4" />
                        Download Invoice
                      </button>
                      {order.status === 'paid' && (
                        <button className="flex items-center gap-1 text-gray-600 hover:underline">
                          <Package className="w-4 h-4" />
                          Reorder Items
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrdersPage;
