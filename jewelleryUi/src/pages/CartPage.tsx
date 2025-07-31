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
    loadAddresses();
  }, [loadAddresses]);

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
                className="text-theme-primary hover:text-theme-muted p-2 rounded-xl hover:bg-theme-secondary transition-all shadow-sm"
                title="Close and continue shopping"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start space-x-4 pb-4 border-b border-theme-secondary/30">
                    <img
                      src={
                        item.product.images[0]?.startsWith('http')
                          ? item.product.images[0]
                          : `${staticImageBaseUrl}/${item.product.images[0]}`
                      }
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                    <div className="flex-1 text-theme-primary">
                      <h3 className="text-base font-semibold italic mb-1 line-clamp-2">{item.product.name}</h3>
                      {item.selectedSize && (
                        <p className="text-sm text-theme-muted mb-1">Size: {item.selectedSize}</p>
                      )}
                      <div className="text-base mb-3">
                        {item.quantity} x Rs. {item.product.price.toLocaleString()}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleQuantityChange(item.id, -1)} className="w-8 h-8 border rounded-xl">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button onClick={() => handleQuantityChange(item.id, 1)} className="w-8 h-8 border rounded-xl">
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleRemoveItem(item.id, item.product.name)}
                          className="text-sm italic text-theme-primary hover:text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <div className="card-elegant sticky rounded-lg p-5 bg-theme-surface">
                  <h2 className="text-lg font-semibold italic mb-4">Order Summary</h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-sm italic">SUBTOTAL:</span>
                      <span className="text-sm font-semibold">Rs. {getTotalPrice().toLocaleString()}</span>
                    </div>
                    <div className="text-xs italic text-theme-muted">
                      Taxes and shipping will be calculated at checkout.
                    </div>
                    <div className="flex items-start text-xs italic text-theme-primary space-x-2">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                      />
                      <label htmlFor="terms">I agree with the Terms and Conditions.</label>
                    </div>
                  </div>

                  {selectedAddress ? (
                    <>
                      <div className="space-y-2 mb-4 text-sm text-theme-primary">
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
                          className="text-theme-muted underline text-xs hover:text-theme-primary"
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
                      className={`btn-primary p-2 rounded-md w-full mt-4 ${!agreedToTerms ? 'opacity-50 cursor-not-allowed' : ''}`}
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
          <div>
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setShowAddressSelector(false)}
                className="text-theme-primary hover:text-theme-muted flex items-center space-x-2"
              >
                <X className="h-5 w-5" />
                <span>Back to Cart</span>
              </button>
              <button
                onClick={handleOpenAddressForm}
                className="text-sm bg-theme-primary text-theme-light px-4 py-2 rounded hover:bg-theme-dark"
              >
                + Add New Address
              </button>
            </div>
            <AddressSelector />
            {selectedAddress && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowAddressSelector(false)}
                  className="btn-primary px-8"
                >
                  Continue to Payment
                </button>
              </div>
            )}
          </div>
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
