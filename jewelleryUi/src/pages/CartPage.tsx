import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Minus, ShoppingBag, X } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import PaymentHandler from '../components/payment/PaymentHandler';
import AddressSelector from '../components/address/AddressSelector';
import AddressForm from '../components/address/AddressForm';
import { useAddressStore } from '../store/addressStore';
import { staticImageBaseUrl } from '../constants/siteConfig';
import { AddressFormData, Address } from '../types/address';

const CartPage: React.FC = () => {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { selectedAddress, addAddress, updateAddress, loadAddresses } = useAddressStore();

  const [agreedToTerms, setAgreedToTerms] = React.useState(false);
  const [showAddressSelector, setShowAddressSelector] = React.useState(false);
  const [isAddressFormOpen, setIsAddressFormOpen] = React.useState(false);
  const [editingAddress, setEditingAddress] = React.useState<Address | null>(null);
  const [formLoading, setFormLoading] = React.useState(false);

React.useEffect(() => {
  (async () => {
    try {
      const fetchedAddresses = await loadAddresses();

      const defaultAddress = fetchedAddresses.find(addr => addr.isDefault);
      const fallback = fetchedAddresses[0];

      if (defaultAddress || fallback) {
        useAddressStore.getState().setSelectedAddress(defaultAddress || fallback);
      }
    } catch (err) {
      console.error('Error loading addresses:', err);
    }
  })();
}, []);




  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-theme-background flex flex-col items-center justify-center px-4 text-center">
        <ShoppingBag className="h-16 w-16 text-theme-muted mb-4" />
        <h2 className="text-2xl font-bold text-theme-primary mb-2">Please log in to view your cart</h2>
        <p className="text-theme-muted mb-8">You need to be logged in to manage your cart and proceed with checkout.</p>
        <Link
          to="/login"
          className="bg-theme-primary text-theme-light px-8 py-3 rounded font-semibold hover:bg-theme-dark transition-colors"
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

  const handleOpenAddressForm = () => {
    setEditingAddress(null);
    setIsAddressFormOpen(true);
  };

  const handleCloseAddressForm = () => {
    setIsAddressFormOpen(false);
    setEditingAddress(null);
  };

  const handleSaveAddress = async (addressData: AddressFormData) => {
    setFormLoading(true);
    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, addressData);
      } else {
        await addAddress(addressData);
      }
      handleCloseAddressForm();
    } catch (error) {
      console.error('Failed to save address:', error);
      throw error;
    } finally {
      setFormLoading(false);
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
            className="bg-theme-primary text-theme-light px-8 py-3 rounded font-semibold hover:bg-theme-dark transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-background pt-16 sm:pt-20 lg:pt-24 font-serif">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 max-w-7xl">
        {!showAddressSelector ? (
          <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 lg:mb-10 gap-4">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-semibold italic text-theme-primary">
                MY BAG ({items.length})
              </h1>
              <button
                onClick={() => navigate('/')}
                className="text-theme-primary hover:text-theme-muted p-2 sm:p-3 rounded-xl hover:bg-theme-secondary transition-all shadow-sm"
                title="Close and continue shopping"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 items-start">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6 pb-4 sm:pb-6 border-b border-theme-secondary/30 last:border-b-0">
                    {/* Product Image */}
                    <img
                      src={
                        item.product.images[0]?.startsWith('http')
                          ? item.product.images[0]
                          : `${staticImageBaseUrl}/${item.product.images[0]}`
                      }
                      alt={item.product.name}
                      className="w-full sm:w-24 lg:w-28 h-48 sm:h-24 lg:h-28 object-cover rounded-xl flex-shrink-0"
                    />

                    {/* Product Details */}
                    <div className="flex-1 text-theme-primary space-y-3 sm:space-y-2">
                      <h3 className="text-base sm:text-lg font-semibold italic line-clamp-2 leading-tight">
                        {item.product.name}
                      </h3>
                      {item.selectedSize && (
                        <p className="text-sm sm:text-base text-theme-muted">Size: {item.selectedSize}</p>
                      )}
                      <div className="text-base sm:text-lg font-medium">
                        {item.quantity} x Rs. {item.product.price.toLocaleString()}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between sm:justify-start space-x-4 sm:space-x-6">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleQuantityChange(item.id, -1)}
                            className="w-8 h-8 sm:w-10 sm:h-10 border border-theme-primary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-theme-surface transition-colors"
                          >
                            <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                          <span className="w-8 sm:w-10 text-center text-base sm:text-lg font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, 1)}
                            className="w-8 h-8 sm:w-10 sm:h-10 border border-theme-primary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-theme-surface transition-colors"
                          >
                            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id, item.product.name)}
                          className="text-sm sm:text-base italic text-theme-primary hover:text-red-500 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="card-elegant sticky top-24 rounded-xl p-5 sm:p-6 lg:p-8 bg-theme-surface">
                  <h2 className="text-lg sm:text-xl font-semibold italic mb-4 sm:mb-6">Order Summary</h2>

                  <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    <div className="flex justify-between">
                      <span className="text-sm sm:text-base italic">SUBTOTAL:</span>
                      <span className="text-sm sm:text-base font-semibold">Rs. {getTotalPrice().toLocaleString()}</span>
                    </div>
                    <div className="text-xs sm:text-sm italic text-theme-muted">
                      Taxes and shipping will be calculated at checkout.
                    </div>
                    <div className="flex items-start text-xs sm:text-sm italic text-theme-primary space-x-2 sm:space-x-3">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-1"
                      />
                      <label htmlFor="terms">I agree with the Terms and Conditions.</label>
                    </div>
                  </div>

                  {selectedAddress ? (
                    <>
                      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 text-sm sm:text-base text-theme-primary">
                        <div>
                          <div className="font-semibold italic">{selectedAddress.addressType}</div>
                          <div>{selectedAddress.fullName}</div>
                          <div>{selectedAddress.mobileNumber}</div>
                          <div>
                            {selectedAddress.streetArea}, {selectedAddress.city} - {selectedAddress.pincode}
                          </div>
                          <div>{selectedAddress.state}</div>
                        </div>
                        <button
                          onClick={() => setShowAddressSelector(true)}
                          className="text-theme-muted underline text-xs sm:text-sm hover:text-theme-primary transition-colors"
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
                      onClick={() => setShowAddressSelector(true)}
                      className={`btn-primary py-3 sm:py-4 rounded-lg w-full text-sm sm:text-base font-semibold ${!agreedToTerms ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={!agreedToTerms}
                    >
                      SELECT DELIVERY ADDRESS
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Address Selection View */}
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
                <button
                  onClick={() => setShowAddressSelector(false)}
                  className="text-theme-primary hover:text-theme-muted flex items-center space-x-2 sm:space-x-3"
                >
                  <X className="h-5 w-5" />
                  <span className="text-sm sm:text-base">Back to Cart</span>
                </button>
                <button
                  onClick={handleOpenAddressForm}
                  className="w-full sm:w-auto text-sm sm:text-base bg-theme-primary text-theme-light px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-theme-dark transition-colors"
                >
                  + Add New Address
                </button>
              </div>
              <AddressSelector />
              {selectedAddress && (
                <div className="mt-6 sm:mt-8 text-center">
                  <button
                    onClick={() => setShowAddressSelector(false)}
                    className="btn-primary px-8 sm:px-12 py-3 sm:py-4 text-sm sm:text-base rounded-lg"
                  >
                    Continue to Payment
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <AddressForm
        isOpen={isAddressFormOpen}
        onClose={handleCloseAddressForm}
        onSave={handleSaveAddress}
        loading={formLoading}
        address={editingAddress}
      />
    </div>
  );
};

export default CartPage;
