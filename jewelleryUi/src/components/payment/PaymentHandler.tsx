// src/components/payment/PaymentHandler.tsx

import React from 'react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { apiService } from '../../services/api';
import { SITE_CONFIG } from '../../constants/siteConfig';
import { useAddressStore } from '../../store/addressStore';
import { AddressFormData } from '../../types/address';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentHandlerProps {
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
  isTermsAccepted: boolean; // Add this line
  paymentType?: 'full' | 'half';
  onPaymentTypeChange?: (type: 'full' | 'half') => void;
}

const PaymentHandler: React.FC<PaymentHandlerProps> = ({ 
  onSuccess, 
  onError, 
  isTermsAccepted, 
  paymentType = 'full',
  onPaymentTypeChange 
}) => {
  const { getTotalPrice, clearCart, items } = useCartStore();
  const { user } = useAuthStore();
  const { selectedAddress } = useAddressStore();
  const baseFocusClasses = "focus:outline-none focus:ring-0";

  // Check if any item supports half payment
  const hasHalfPaymentItems = items.some(item => item.product.isHalfPaymentAvailable);

  const calculatePaymentAmount = () => {
    if (paymentType === 'half') {
      // Calculate 50% of total amount
      return Math.round(getTotalPrice() * 0.5);
    }
    
    // Full payment - return total amount
    return getTotalPrice();
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
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

  const handlePayment = async () => {
    try {
      const { isAuthenticated } = useAuthStore.getState();

      if (!isAuthenticated) {
        onError('Please log in to proceed with payment');
        return;
      }

      if (items.length === 0) {
        onError('Cart is empty');
        return;
      }

      if (!selectedAddress) {
        onError('Please select a delivery address');
        return;
      }

      if (!isTermsAccepted) {
        onError('Please agree to the Terms and Conditions');
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        onError('Failed to load payment gateway');
        return;
      }

      const totalAmount = getTotalPrice();
      if (totalAmount <= 0) {
        onError('Cart is empty or invalid amount');
        return;
      }

      // Calculate half payment amount if applicable
      const actualPaymentAmount = calculatePaymentAmount();
      const isHalfPayment = paymentType === 'half';
      const isHalfPaid = paymentType === 'half';

      const orderResponse = await apiService.createOrder({
        amount: Math.round(actualPaymentAmount * 100),
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
          name: item.product.name,
          selectedSize: item.selectedSize,
          image: item.product.images[0] || ''
        })),
        shippingAddress: selectedAddress as AddressFormData,
        isHalfPaid,
        remainingAmount: isHalfPayment ? Math.round((totalAmount - actualPaymentAmount) * 100) : 0,
        paymentType,
        notes: {
          userId: user?.id || '',
          userEmail: user?.email || '',
          itemCount: items.length.toString(),
          paymentType: paymentType,
        },
      });

      const orderData = orderResponse;
      if (!orderData || !orderData.id || !orderData.orderId) {
        onError('Failed to create order');
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_key',
        amount: orderData.amount,
        currency: orderData.currency,
        name: SITE_CONFIG.name,
        description: 'Jewelry Purchase',
        order_id: orderData.orderId, // Use the Razorpay orderId for first payment
        handler: async (response: any) => {
          try {
            if (!response || !response.razorpay_order_id) {
              onError('Invalid payment response');
              return;
            }

            const verificationResult = await apiService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verificationResult?.status === 'success') {
              const cartIdsToRemove = items.map(item => item.id); // assuming `item.cartId` exists
              await clearCart(cartIdsToRemove);
              // Use the internal order ID, not the Razorpay order ID
              onSuccess(orderData.internalOrderId || orderData.id);
            }
            else {
              onError('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            onError('Payment verification failed');
          }
        },
        prefill: {
          email: user?.email || '',
          contact: user?.contact || '',
        },
        notes: {
          address_id: selectedAddress?.id || '',
          user_id: user?.id || '',
          payment_type: paymentType,
          is_half_payment: isHalfPayment.toString(),
        },
        theme: {
          color: 'var(--color-theme-primary)',
        },
        modal: {
          ondismiss: () => {
            console.log('Payment cancelled by user');
            // Don't show error for user cancellation
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      onError('Failed to initiate payment');
    }
  };

  return (
    <div className="space-y-4">
      {/* Payment Type Selection */}
      {hasHalfPaymentItems && onPaymentTypeChange && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-serif font-semibold italic text-blue-800 mb-3">
            Payment Options
          </h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="paymentType"
                value="full"
                checked={paymentType === 'full'}
                onChange={() => onPaymentTypeChange('full')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-serif italic text-blue-700">
                Pay Full Amount (₹{getTotalPrice().toLocaleString()})
              </span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="paymentType"
                value="half"
                checked={paymentType === 'half'}
                onChange={() => onPaymentTypeChange('half')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-serif italic text-blue-700">
                Pay 50% Now (₹{Math.round(getTotalPrice() * 0.5).toLocaleString()})
              </span>
            </label>
          </div>
          {paymentType === 'half' && (
            <p className="text-xs text-blue-600 mt-2 font-serif italic">
              Remaining ₹{Math.round(getTotalPrice() * 0.5).toLocaleString()} will be collected after shipment
            </p>
          )}
        </div>
      )}

      <button
        onClick={handlePayment}
        className={`btn-primary rounded-md p-2 text-theme-light bg-theme-primary hover:bg-theme-dark w-full ${!isTermsAccepted ? 'opacity-50 cursor-not-allowed' : ''} ${baseFocusClasses}`}
        title="Proceed to secure payment"
        disabled={!isTermsAccepted}
      >
        {paymentType === 'half' 
          ? `PAY 50% NOW (₹${Math.round(getTotalPrice() * 0.5).toLocaleString()})`
          : 'PROCEED TO CHECKOUT'
        }
      </button>
    </div>
  );
};

export default PaymentHandler;