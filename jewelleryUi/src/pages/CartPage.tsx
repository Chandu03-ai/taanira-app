import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Minus, ShoppingBag, X } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import PaymentHandler from '../components/payment/PaymentHandler';
import AddressSelector from '../components/address/AddressSelector';
import { useAddressStore } from '../store/addressStore';
import { staticImageBaseUrl } from '../constants/siteConfig';

const CartPage: React.FC = () => {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { selectedAddress } = useAddressStore();
  const navigate = useNavigate();
  const [showAddressSelector, setShowAddressSelector] = React.useState(false);

  // Redirect unauthenticated users to login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
        <ShoppingBag className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Please log in to view your cart</h2>
        <p className="text-gray-600 mb-8">You need to be logged in to manage your cart and proceed with checkout.</p>
        <Link
          to="/login"
          className="bg-black text-white px-8 py-3 rounded font-semibold hover:bg-gray-800 transition-colors"
        >
          Login
        </Link>
      </div>
    );
  }

  const handleQuantityChange = (cartItemId: string, delta: number) => {
    const item = items.find(i => i.id === cartItemId);
    if (!item) return;

    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      removeItem(cartItemId);
    } else {
      updateQuantity(cartItemId, delta); // IMPORTANT: use `item.id` here
    }
  };

  const handleRemoveItem = (cartItemId: string, productName: string) => {
    if (confirm(`Remove ${productName} from cart?`)) {
      removeItem(cartItemId);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8">Add some beautiful jewelry to your cart to get started!</p>
          <Link
            to="/products"
            className="bg-black text-white px-8 py-3 rounded font-semibold hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-subtle-beige pt-16 sm:pt-20 font-serif">
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 max-w-7xl">
      {!showAddressSelector ? (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-serif font-semibold italic text-rich-brown">
              MY BAG ({items.length})
            </h1>
            <button 
              onClick={() => navigate('/')} 
              className="text-rich-brown hover:text-mocha p-2 rounded-xl hover:bg-soft-gold transition-all duration-200 ease-in-out shadow-sm"
              title="Close and continue shopping"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            {/* Cart Items */}
            <div className="lg:col-span-2 order-2 lg:order-1 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-start space-x-4 pb-4 border-b border-soft-gold/30 last:border-b-0">
                  <img
                    src={
                      item.product.images[0]?.startsWith('http')
                        ? item.product.images[0]
                        : `${staticImageBaseUrl}/${item.product.images[0]}`
                    }
                    alt={item.product.name}
                    className="w-20 h-20 lg:w-24 lg:h-24 object-cover rounded-xl shadow-sm"
                  />
                  <div className="flex-1 text-rich-brown">
                    <h3 className="text-base font-serif font-semibold italic mb-1 line-clamp-2">{item.product.name}</h3>
                    <div className="text-base font-serif font-light mb-3">
                      {item.quantity} x Rs. {item.product.price.toLocaleString()}
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      {/* Quantity */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="w-8 h-8 border border-soft-gold rounded-xl flex items-center justify-center hover:bg-soft-gold transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
                          title="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-base font-serif font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="w-8 h-8 border border-soft-gold rounded-xl flex items-center justify-center hover:bg-soft-gold transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
                          title="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.id, item.product.name)}
                        className="text-sm font-serif italic text-rich-brown hover:text-red-500 transition-all duration-200 ease-in-out"
                        title={`Remove ${item.product.name} from cart`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              <div className="card-elegant sticky top-24 lg:top-28">
                <h2 className="text-lg font-serif font-semibold italic text-rich-brown mb-4">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-sm font-serif italic text-rich-brown">SUBTOTAL:</span>
                    <span className="text-sm font-serif font-semibold">Rs. {getTotalPrice().toLocaleString()}</span>
                  </div>
                  <div className="text-xs font-serif italic text-mocha">
                    Taxes and shipping will be calculated at checkout.
                  </div>
                  <div className="flex items-start text-xs font-serif italic text-rich-brown space-x-2">
                    <input type="checkbox" className="mr-2 mt-0.5 accent-soft-gold rounded" />
                    <span>I agree with the Terms and Conditions.</span>
                  </div>
                </div>

                {selectedAddress ? (
                  <>
                    <div className="mb-4 p-4 bg-subtle-beige border border-soft-gold/30 rounded-xl text-sm font-serif">
                      <p className="font-semibold italic text-rich-brown">Delivering to:</p>
                      <p className="text-rich-brown font-light">{selectedAddress.fullName}</p>
                      <p className="text-rich-brown font-light">{selectedAddress.city}, {selectedAddress.state}</p>
                      <button
                        onClick={() => setShowAddressSelector(true)}
                        className="text-mocha underline text-xs mt-1 hover:text-rich-brown transition-all duration-200 ease-in-out font-serif italic"
                        title="Change delivery address"
                      >
                        Change Address
                      </button>
                    </div>
                    <PaymentHandler
                      onSuccess={(orderId) => navigate(`/order-confirmation/${orderId}`)}
                      onError={(error) => alert(`Payment failed: ${error}`)}
                    />
                  </>
                ) : (
                  <button
                    onClick={() => setShowAddressSelector(true)}
                    className="btn-primary w-full"
                    title="Select delivery address"
                  >
                    SELECT DELIVERY ADDRESS
                  </button>
                )}

                {/* Features */}
                <div className="mt-6 space-y-3 text-xs font-serif text-rich-brown">
                  <div className="flex items-center space-x-2">
                    <span>🔄</span>
                    <div>
                      <div className="font-semibold italic">NO RETURNS/EXCHANGES</div>
                      <div>ONCE SOLD</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>🛡️</span>
                    <div className="font-semibold italic">PURE SILVER</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>🚚</span>
                    <div className="font-semibold italic">FREE SHIPPING WITHIN INDIA</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        // Address Selector View (just style buttons below)
        <div>
          <div className="flex items-center mb-6">
            <button
              onClick={() => setShowAddressSelector(false)}
              className="flex items-center space-x-2 text-rich-brown hover:text-mocha mr-4 p-2 rounded-xl hover:bg-soft-gold transition-all duration-200 ease-in-out font-serif italic"
              title="Back to cart"
            >
              <X className="h-5 w-5" />
              <span>Back to Cart</span>
            </button>
            <h1 className="text-xl font-serif font-semibold italic text-rich-brown">Select Delivery Address</h1>
          </div>

          <AddressSelector
            onAddressSelect={() => setShowAddressSelector(false)}
          />

          {selectedAddress && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowAddressSelector(false)}
                className="btn-primary px-8"
                title="Continue to payment"
              >
                Continue to Payment
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);

};

export default CartPage;
