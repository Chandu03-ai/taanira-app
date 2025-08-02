import React, { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  ChevronUp,
  ChevronDown,
  Copy,
  Check,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { SITE_CONFIG, staticImageBaseUrl } from '../constants/siteConfig';
import { Order } from '../types';
import { formatReadableDate } from '../utils/dateUtils';

// Add Razorpay script loading function
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const UserOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');
  const { isAuthenticated } = useAuthStore();

  const handlePayRemaining = async (orderId: string, remainingAmount: number) => {
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Failed to load payment gateway');
        return;
      }
      
      // Find the order to get the secondOrderId
      const order = orders.find(o => o.id === orderId);
      if (!order || !order.secondOrderId) {
        alert('Second payment order not available. Please contact support.');
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_key',
        amount: remainingAmount,
        currency: 'INR',
        name: SITE_CONFIG.name,
        description: 'Remaining Payment',
        order_id: order.secondOrderId, // Use the secondOrderId for remaining payment
        handler: async (response: any) => {
          try {
            await apiService.remainingVerifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            loadOrders();
            alert('Remaining payment completed successfully!');
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed');
          }
        },
        prefill: {
          email: useAuthStore.getState().user?.email || '',
          contact: useAuthStore.getState().user?.contact || '',
        },
        theme: {
          color: 'var(--color-theme-primary)',
        },
        modal: {
          ondismiss: () => {
            console.log('Remaining payment cancelled by user');
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error initiating remaining payment:', error);
      alert('Failed to initiate remaining payment');
    }
  };

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

  const filteredOrders = orders.filter((order) =>
    statusFilter === 'all' ? true : order.status === statusFilter
  );

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const timeA = a.createdAt ? parseInt(a.createdAt) : 0;
    const timeB = b.createdAt ? parseInt(b.createdAt) : 0;
    return sortOrder === 'latest' ? timeB - timeA : timeA - timeB;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex items-center justify-center px-4">
        <div className="text-center space-y-2 w-full max-w-md mx-auto">
          <Package className="h-12 w-12 text-gray-400 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-800">Please Log In</h2>
          <p className="text-gray-500 text-sm">Login to view your orders.</p>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner message="Loading your orders..." />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 sm:pt-24 pb-10 px-4 sm:px-6 lg:px-8">
      {/* Centered container with max-width */}
      <div className="w-full max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-sm sm:text-base text-gray-500">View all your purchases and their statuses</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 whitespace-nowrap">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 sm:flex-none text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="created">Created</option>
                <option value="failed">Failed</option>
                <option value="attempted">Attempted</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 whitespace-nowrap">Sort by:</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'latest' | 'oldest')}
                className="flex-1 sm:flex-none text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 text-center">
            <Package className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-medium text-gray-800 mb-2">No orders placed yet</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-6">Start shopping to place your first order.</p>
            <a
              href="/products"
              className="bg-black text-white px-6 py-3 rounded-md text-sm sm:text-base hover:bg-gray-800 transition"
            >
              Browse Products
            </a>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {sortedOrders.map((order) => {
              const isSelected = selectedOrder?.id === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-xl shadow-sm p-4 sm:p-6 transition hover:shadow-md"
                >
                  {/* Order header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                    <div className="flex-1">
                      <p className="text-sm sm:text-base font-medium text-gray-500">order : {order.id.slice(-8)}</p>
                      <p className="text-xs sm:text-sm text-gray-400">{formatReadableDate(order.createdAt)}</p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusStyle(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </div>

                  {/* Summary row */}
                  <div
                    onClick={() => setSelectedOrder(isSelected ? null : order)}
                    className="cursor-pointer"
                  >
                    <div className="flex justify-between items-center text-sm sm:text-base text-gray-700 mb-3">
                      <span>Items: {order.items.length}</span>
                      <span className="font-semibold">
                        {SITE_CONFIG.currencySymbol}
                        {order.isHalfPaid && order.halfPaymentStatus === 'pending' 
                          ? `${((order.amount + (order.remainingAmount || 0)) / 100).toLocaleString()} (Half Paid)`
                          : (order.amount / 100).toLocaleString()
                        }
                      </span>
                    </div>

                    {order.trackingNumber && (
                      <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-700 gap-2 mb-3">
                        <span className="font-medium">Tracking ID:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 font-mono text-xs sm:text-sm break-all">{order.trackingNumber}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(order.trackingNumber, order.id);
                            }}
                            className="p-1.5 rounded hover:bg-gray-100 active:scale-95 transition flex-shrink-0"
                            title="Copy"
                          >
                            {copiedOrderId === order.id ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-end text-xs sm:text-sm text-purple-600 gap-1">
                      {isSelected ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          View Details
                        </>
                      )}
                    </div>

                    {/* Half Payment Status */}
                    {order.isHalfPaid && order.halfPaymentStatus === 'pending' && (
                      <div className="mt-4 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-yellow-800">Payment Pending</p>
                            <p className="text-xs sm:text-sm text-yellow-700">
                              ₹{((order.remainingAmount || 0) / 100).toLocaleString()} is due
                            </p>
                            {!order.enableRemainingPayment && (
                              <p className="text-xs text-gray-600 mt-1">
                                Payment will be enabled after tracking ID is sent
                              </p>
                            )}
                          </div>
                          {order.enableRemainingPayment && !order.secondOrderId && (
                            <button
                              onClick={() => handlePayRemaining(order.id, order.remainingAmount || 0)}
                              className="w-full sm:w-auto bg-yellow-600 text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-yellow-700 transition-colors"
                            >
                              Pay Remaining
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Order items */}
                  {isSelected && (
                    <div className="mt-6 border-t border-gray-200 pt-6 space-y-4">
                      <p className="text-sm sm:text-base font-semibold text-gray-800">Items in this order:</p>
                      <div className="space-y-4">
                        {order.items.map((item, i) => (
                          <div key={item.productId + '-' + i} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                            <img
                              src={staticImageBaseUrl + item.image}
                              alt={item.name}
                              className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 text-sm sm:text-base line-clamp-2">{item.name}</p>
                              {item.selectedSize && <p className="text-gray-500 text-xs sm:text-sm">Size: {item.selectedSize}</p>}
                              <p className="text-gray-500 text-xs sm:text-sm">Qty: {item.quantity}</p>
                            </div>
                            <div className="font-medium text-gray-700 text-sm sm:text-base text-right">
                              {SITE_CONFIG.currencySymbol}
                              {item.price.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrdersPage;