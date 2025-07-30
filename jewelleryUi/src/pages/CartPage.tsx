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
  const [agreedToTerms, setAgreedToTerms] = React.useState(false);
  const { selectedAddress } = useAddressStore();
  const navigate = useNavigate();
  const [showAddressSelector, setShowAddressSelector] = React.useState(false);
  const baseFocusClasses = "focus:outline-none focus:ring-0";

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-theme-background flex flex-col items-center justify-center px-4 text-center">
        <ShoppingBag className="h-16 w-16 text-theme-muted mb-4" />
        <h2 className="text-2xl font-bold text-theme-primary mb-2">Please log in to view your cart</h2>
        <p className="text-theme-muted mb-8">You need to be logged in to manage your cart and proceed with checkout.</p>
        <Link
          to="/login"
          className={`bg-theme-primary text-theme-light px-8 py-3 rounded font-semibold hover:bg-theme-dark transition-colors ${baseFocusClasses}`}
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
      updateQuantity(cartItemId, delta);
    }
  };

  const handleRemoveItem = (cartItemId: string, productName: string) => {
    if (confirm(`Remove ${productName} from cart?`)) {
      removeItem(cartItemId);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-theme-background flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-theme-muted mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-theme-primary mb-2">Your Cart is Empty</h2>
          <p className="text-theme-muted mb-8">Add some beautiful jewelry to your cart to get started!</p>
          <Link
            to="/products"
            className={`bg-theme-primary text-theme-light px-8 py-3 rounded font-semibold hover:bg-theme-dark transition-colors ${baseFocusClasses}`}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-background pt-16 sm:pt-20 font-serif">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 max-w-6xl">
        {!showAddressSelector ? (
          <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-serif font-semibold italic text-theme-primary">
                MY BAG ({items.length})
              </h1>
              <button
                onClick={() => navigate('/')}
                className={`text-theme-primary hover:text-theme-muted p-2 rounded-xl hover:bg-theme-secondary transition-all duration-200 ease-in-out shadow-sm ${baseFocusClasses}`}
                title="Close and continue shopping"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
              <div className="order-2 lg:order-1 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start space-x-4 pb-4 border-b border-theme-secondary/30 last:border-b-0">
                    <img
                      src={
                        item.product.images[0]?.startsWith('http')
                          ? item.product.images[0]
                          : `${staticImageBaseUrl}/${item.product.images[0]}`
                      }
                      alt={item.product.name}
                      className="w-20 h-20 lg:w-24 lg:h-24 object-cover rounded-xl shadow-sm"
                    />
                    <div className="flex-1 text-theme-primary">
                      <h3 className="text-base font-serif font-semibold italic mb-1 line-clamp-2">{item.product.name}</h3>
                      {item.selectedSize && item.product.category && (
                        <p className="text-sm font-serif font-light text-theme-muted mb-1">Size: {item.selectedSize}</p>
                      )}
                      <div className="text-base font-serif font-light mb-3">
                        {item.quantity} x Rs. {item.product.price.toLocaleString()}
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, -1)}
                            className={`w-8 h-8 border border-theme-secondary rounded-xl flex items-center justify-center hover:bg-theme-secondary transition-all duration-200 ease-in-out shadow-sm hover:shadow-md ${baseFocusClasses}`}
                            title="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-base font-serif font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, 1)}
                            className={`w-8 h-8 border border-theme-secondary rounded-xl flex items-center justify-center hover:bg-theme-secondary transition-all duration-200 ease-in-out shadow-sm hover:shadow-md ${baseFocusClasses}`}
                            title="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.id, item.product.name)}
                          className={`text-sm font-serif italic text-theme-primary hover:text-red-500 transition-all duration-200 ease-in-out ${baseFocusClasses}`}
                          title={`Remove ${item.product.name} from cart`}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-1 lg:order-2">

                <div className="card-elegant sticky rounded-lg p-5 top-24 lg:top-28 bg-theme-surface">
                  <h2 className="text-lg font-serif font-semibold italic text-theme-primary mb-4">Order Summary</h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-sm font-serif italic text-theme-primary">SUBTOTAL:</span>
                      <span className="text-sm font-serif font-semibold">Rs. {getTotalPrice().toLocaleString()}</span>
                    </div>
                    <div className="text-xs font-serif italic text-theme-muted">
                      Taxes and shipping will be calculated at checkout.
                    </div>
                    <div className="flex items-start text-xs font-serif italic text-theme-primary space-x-2">
                      <input
                        type="checkbox"
                        id="terms"
                        className={`mr-2 mt-0.5 accent-theme-secondary rounded ${baseFocusClasses}`}
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                      />
                      <label htmlFor="terms">I agree with the Terms and Conditions.</label>
                    </div>
                  </div>

                  {selectedAddress ? (
                    <>
                      {/* ... display selected address ... */}
                      <div className="space-y-2 mb-4 text-sm font-serif text-theme-primary">
                        <div>
                          <div className="font-semibold italic">{selectedAddress.addressType}</div>
                          <div>{selectedAddress.fullName}</div>
                          {selectedAddress.houseNumber && <div>{selectedAddress.mobileNumber}</div>}
                          <div>{selectedAddress.streetArea}, {selectedAddress.city} - {selectedAddress.pincode}</div>
                          <div>{selectedAddress.state}</div>
                        </div>
                        <button
                          onClick={() => setShowAddressSelector(true)}
                          className={`text-theme-muted underline text-xs hover:text-theme-primary transition-all duration-200 ease-in-out font-serif italic ${baseFocusClasses}`}
                          title="Change delivery address"
                        >
                          Change Address
                        </button>
                      </div>

                      <PaymentHandler
                        onSuccess={(orderId) => navigate(`/order-confirmation/${orderId}`)}
                        onError={(error) => alert(`Payment failed: ${error}`)}
                        isTermsAccepted={agreedToTerms}
                      />
                    </>
                  ) : (
                    <button
                      onClick={() => navigate('/addresses')} // Correctly sets state to show AddressSelector
                      className={`btn-primary p-2 rounded-md text-theme-light bg-theme-primary hover:bg-theme-dark w-full mt-4 ${baseFocusClasses} ${!agreedToTerms ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={!agreedToTerms}
                      title="Select delivery address"
                    >
                      SELECT DELIVERY ADDRESS
                    </button>
                  )}

                  <div className="mt-6 space-y-3 text-xs font-serif text-theme-primary">
                    <div className="flex items-center space-x-2">
                      <span>🔄</span>
                      <div>
                        <div className="font-semibold italic">NO RETURNS/EXCHANGES</div>
                        <div>ONCE SOLD</div>
                      </div>
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
          <div>
            <div className="flex items-center mb-6">
              <button
                onClick={() => setShowAddressSelector(false)}
                className={`flex items-center space-x-2 text-theme-primary hover:text-theme-muted mr-4 p-2 rounded-xl hover:bg-theme-secondary transition-all duration-200 ease-in-out font-serif italic ${baseFocusClasses}`}
                title="Back to cart"
              >
                <X className="h-5 w-5" />
                <span>Back to Cart</span>
              </button>
              <h1 className="text-xl font-serif font-semibold italic text-theme-primary">Select Delivery Address</h1>
            </div>

            <AddressSelector />

            {selectedAddress && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowAddressSelector(false)}
                  className={`btn-primary px-8 ${baseFocusClasses}`}
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