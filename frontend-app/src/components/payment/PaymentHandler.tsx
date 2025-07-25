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
}

const PaymentHandler: React.FC<PaymentHandlerProps> = ({ onSuccess, onError }) => {
  const { getTotalPrice, clearCart, items } = useCartStore();
  const { user } = useAuthStore();
  const { selectedAddress } = useAddressStore();

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

      const orderResponse = await apiService.createOrder({
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
          name: item.product.name,
          image: item.product.images[0] || ''
        })),
        shippingAddress: selectedAddress as AddressFormData,
        notes: {
          userId: user?.id || '',
          userEmail: user?.email || '',
          itemCount: items.length.toString(),
        },
      });

      const orderData = orderResponse;
      if (!orderData || !orderData.id) {
        onError('Failed to create order');
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_key',
        amount: orderData.amount,
        currency: orderData.currency,
        name: SITE_CONFIG.name,
        description: 'Jewelry Purchase',
        order_id: orderData.id,
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

            if (verificationResult && verificationResult.status === 'success') {
              clearCart();
              onSuccess(orderData.id);
            } else {
              onError('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            onError('Payment verification failed');
          }
        },
        prefill: {
          name: `${user?.firstname || ''} ${user?.lastname || ''}`,
          email: user?.email || '',
          contact: user?.contact || '',
        },
        notes: {
          address_id: selectedAddress?.id || '',
          user_id: user?.id || '',
        },
        theme: {
          color: '#000000',
        },
        modal: {
          ondismiss: () => {
            onError('Payment cancelled');
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
    <button
      onClick={handlePayment}
      className="btn-primary w-full"
      title="Proceed to secure payment"
    >
      PROCEED TO CHECKOUT
    </button>
  );
};

export default PaymentHandler;
