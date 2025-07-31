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

const UserOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');


  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');
  const { isAuthenticated } = useAuthStore();

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Orders</h1>
        <p className="text-sm text-gray-500 mb-6">View all your purchases and their statuses</p>

        <div className="flex flex-wrap justify-end gap-2 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="created">Created</option>
              <option value="failed">Failed</option>
              <option value="attempted">Attempted</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700">Sort by:</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'latest' | 'oldest')}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>


        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <Package className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-800 font-medium">No orders placed yet</p>
            <p className="text-sm text-gray-500 mb-4">Start shopping to place your first order.</p>
            <a
              href="/products"
              className="bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition"
            >
              Browse Products
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedOrders.map((order) => {
              const isSelected = selectedOrder?.id === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-xl shadow-sm p-4 transition hover:shadow-md"
                >
                  {/* Order header */}
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs sm:text-sm md:text-base font-medium text-gray-500">order : {order.id.slice(-8)}</p>
                      <p className="text-xs text-gray-400">{formatReadableDate(order.createdAt)}</p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusStyle(
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
                    <div className="mt-2 text-xs text-gray-700 flex justify-between">
                      <span>Items: {order.items.length}</span>
                      <span>
                        {SITE_CONFIG.currencySymbol}
                        {(order.amount / 100).toLocaleString()}
                      </span>
                    </div>
                    {order.trackingNumber && (
                      <div className="pt-2 flex items-center text-sm text-gray-700 gap-2">
                        <span className="font-medium">Tracking ID:</span>
                        <span className="text-gray-900">{order.trackingNumber}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent parent click
                            handleCopy(order.trackingNumber, order.id); // Use your function
                          }}
                          className="ml-1 p-1 rounded hover:bg-gray-100 active:scale-95 transition"
                          title="Copy"
                        >
                          {copiedOrderId === order.id ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                    )}

                    <div className="mt-2 text-xs text-purple-600 flex items-center gap-1 justify-end">
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



                  </div>

                  {/* Order items */}
                  {isSelected && (
                    <div className="mt-4 border-t border-gray-200 pt-4 space-y-4 text-xs">
                      <p className="text-sm font-semibold text-gray-800">Items in this order:</p>
                      {order.items.map((item, i) => (
                        <div key={item.productId + '-' + i} className="flex items-center gap-3">
                          <img
                            src={staticImageBaseUrl + item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{item.name}</p>
                            {item.selectedSize && <p className="text-gray-500">Size: {item.selectedSize}</p>}
                            <p className="text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <div className="font-medium text-gray-700">
                            {SITE_CONFIG.currencySymbol}
                            {item.price.toLocaleString()}
                          </div>
                        </div>
                      ))}
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
