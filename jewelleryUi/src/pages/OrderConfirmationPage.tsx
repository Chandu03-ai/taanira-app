import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Truck, Clock, ArrowLeft, Download, Eye } from 'lucide-react';
import { Order } from '../types';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SEOHead from '../components/seo/SEOHead';
import { SITE_CONFIG, staticImageBaseUrl } from '../constants/siteConfig';
import { useAuthStore } from '../store/authStore';

const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof orderId === 'string') {
      loadOrder(orderId);
    } else {
      setError('Order ID not found');
      setLoading(false);
    }

  }, [orderId]);

  const loadOrder = async (id: string) => {
    try {
      setLoading(true);
      const response = await apiService.getOrder(id);
      setOrder(response);
    } catch (error) {
      console.error('Error loading order:', error);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };



  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your order details..." />;
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-8">{error || 'The order you\'re looking for doesn\'t exist.'}</p>
          <Link
            to="/"
            className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`Order Confirmation - ${SITE_CONFIG.name}`}
        description="Your jewelry order has been confirmed. Thank you for shopping with us!"
      />

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 mt-16 sm:mt-20">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
          </div>

          {/* Success Message */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              Thank You for Your Order!
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              Your payment was successful and your order has been confirmed.
            </p>
            <p className="text-sm text-gray-500">
              Order #{order?.id?.slice(-8)} • Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Order Status */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Status</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

                  <div className={`flex items-center space-x-3 p-4 rounded-lg border ${getPaymentStatusColor(order.status)}`}>
                    <CheckCircle className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Payment Status</p>
                      <p className="text-sm capitalize">{order.status}</p>
                    </div>
                  </div>
                </div>

                {/* Tracking Information */}
                {order.trackingNumber ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Truck className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-900">Tracking Number</p>
                          <p className="text-sm text-blue-700 font-mono">{order.trackingNumber}</p>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Track Package
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-yellow-900">Awaiting Shipment Details</p>
                        <p className="text-sm text-yellow-700">
                          We're preparing your order for shipment. You'll receive tracking details soon.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Items</h2>
                <div className="space-y-4">
                  {order?.items?.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <img
                        src={
                          item.image?.startsWith('http')
                            ? item.image
                            : item.image
                              ? `${staticImageBaseUrl}/${item.image}`
                              : 'https://www.macsjewelry.com/cdn/shop/files/IMG_4360_594x.progressive.jpg?v=1701478772'
                        }
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        {item.selectedSize && item.productId && (
                          <p className="text-sm text-gray-500">Size: {item.selectedSize}</p>
                        )}
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {SITE_CONFIG.currencySymbol}{item.price.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-sm text-gray-500">
                          Total: {SITE_CONFIG.currencySymbol}{(item.price * item.quantity).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              {order.shippingAddress && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Shipping Address</h2>
                  <div className="text-gray-600">
                    <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.houseNumber}</p>
                    <p>{order.shippingAddress.streetArea}</p>
                    {order.shippingAddress.landmark && <p>Landmark: {order.shippingAddress.landmark}</p>}
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                    <p>Mobile: {order.shippingAddress.mobileNumber}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">
                      {SITE_CONFIG.currencySymbol}
                      {order.items
                        ?.reduce((total, item) => total + item.price * item.quantity, 0)
                        .toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                    </span>

                  </div>

                  {/* Show payment breakdown for half payments */}
                  {order.isHalfPaid && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-600">Amount Paid (50%):</span>
                        <span className="font-medium text-blue-600">
                          {SITE_CONFIG.currencySymbol}
                          {(order.amount / 100).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      {order.halfPaymentStatus === 'pending' && (
                        <div className="flex justify-between text-sm">
                          <span className="text-yellow-600">Remaining Due:</span>
                          <span className="font-medium text-yellow-600">
                            {SITE_CONFIG.currencySymbol}
                            {((order.remainingAmount || 0) / 100).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total:</span>
                      <span className="text-lg font-semibold text-gray-900">
                        {SITE_CONFIG.currencySymbol}
                        {order.items
                          ?.reduce((total, item) => total + item.price * item.quantity, 0)
                          .toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                      </span>
                    </div>
                    {order.isHalfPaid && order.halfPaymentStatus === 'pending' && (
                      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800 font-medium">
                          Half Payment Order
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                          You'll receive a payment link for the remaining amount after your order is shipped.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">

                  {isAuthenticated && (
                    <Link
                      to="/user/orders"
                      className="w-full flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View All Orders</span>
                    </Link>
                  )}

                  <Link
                    to="/products"
                    className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-center block"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">What's Next?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Order Processing</h3>
                <p className="text-sm text-gray-600">We're preparing your jewelry with care and attention to detail.</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
                  <Truck className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Shipping Updates</h3>
                <p className="text-sm text-gray-600">You'll receive tracking details via email once your order ships.</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Delivery</h3>
                <p className="text-sm text-gray-600">Your beautiful jewelry will be delivered safely to your doorstep.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderConfirmationPage;