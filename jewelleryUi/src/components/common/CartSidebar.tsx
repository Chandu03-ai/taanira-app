import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Minus, Plus } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { staticImageBaseUrl } from '../../constants/siteConfig';
import { useLocation } from 'react-router-dom';
interface CartSidebarProps {
  onClose: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ onClose }) => {
  const {
    items,
    guestItems,
    removeItem,
    updateQuantity,
    getTotalPrice,
    syncWithServer
  } = useCartStore();

  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); // State to manage update loading
  const baseFocusClasses = "focus:outline-none focus:ring-0";
  const reactRouterLocation = useLocation();
  
  // Get active items based on authentication status
  const activeItems = isAuthenticated ? items : guestItems;
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 200);
    // When the sidebar opens, sync the cart with the server to get the latest state
    if (isAuthenticated) {
      syncWithServer();
    }
    return () => clearTimeout(timer);
  }, [isAuthenticated, syncWithServer]); // Depend on isAuthenticated and syncWithServer

  const handleCheckout = () => {
    onClose();
    if (!isAuthenticated) {
      // Redirect to login with current location for post-login redirect
      navigate('/login', { state: { from: reactRouterLocation } });
      return;
    }
    // Pass current location for post-login redirect if needed
    navigate('/cart', { state: { from: reactRouterLocation } });
  };

  const handleQuantityUpdate = async (id: string, delta: number) => {
    if (isUpdating) return; // Prevent multiple clicks while an update is in progress


    // No need to calculate newQuantity here, the store's updateQuantity will handle it
    // and call removeItem if the resulting quantity is <= 0.

    setIsUpdating(true); // Set loading state for the current operation

    try {
      // Directly pass the delta (+1 or -1) to the store's updateQuantity action
      await updateQuantity(id, delta);
    } catch (error) {
      console.error("Failed to update cart item quantity:", error);
      // Optionally, show a user-friendly error message here
    } finally {
      setIsUpdating(false); // Reset loading state
    }
  };


  return (
    <div className="fixed inset-0 z-50 overflow-hidden lg:overflow-visible">
      <div className="absolute inset-0 bg-theme-dark bg-opacity-50" onClick={onClose}></div>

      <div className="absolute right-0 top-0 h-full w-full max-w-sm sm:max-w-md bg-theme-light shadow-2xl flex flex-col transition-transform duration-300 ease-in-out">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-theme-surface bg-theme-light sticky top-0 z-10">
          <h2 className="text-lg sm:text-xl font-semibold text-theme-primary truncate">
            MY BAG ({activeItems.length})
          </h2>
          <button
            onClick={onClose}
            className={`hover:opacity-70 transition-opacity text-theme-primary p-2 rounded-full hover:bg-theme-surface ${baseFocusClasses}`}
            title="Close cart"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <div
          className={`flex-1 overflow-y-auto p-4 sm:p-6 transition-opacity duration-700 scrollbar-thin scrollbar-thumb-theme-muted scrollbar-track-transparent ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
          {activeItems.length === 0 ? (
            <div className="text-center mt-12 sm:mt-16 animate-fadeInSlow">
              <ShoppingBag className="h-16 w-16 sm:h-20 sm:w-20 text-theme-muted mx-auto mb-4 sm:mb-6" />
              <p className="text-base sm:text-lg text-theme-muted mb-6 sm:mb-8">Your bag is empty</p>
              <Link
                to="/products"
                onClick={onClose}
                className={`inline-block bg-theme-primary text-theme-light px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base rounded-lg hover:bg-theme-dark transition-colors ${baseFocusClasses}`}
                title="Start shopping"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {activeItems.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-start space-x-3 sm:space-x-4 border-b border-theme-surface pb-4 sm:pb-6 last:border-b-0 animate-fadeInSlow"
                  style={{
                    animationDelay: `${index * 0.05}s`,
                    animationFillMode: 'forwards',
                  }}
                >
                  <img
                    src={
                      item.product.images[0]?.startsWith('http')
                        ? item.product.images[0]
                        : `${staticImageBaseUrl}/${item.product.images[0]}`
                    }
                    alt={item.product.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-medium text-theme-primary line-clamp-2 mb-2 sm:mb-3 leading-tight">
                      {item.product.name}
                    </h3>
                    {item.selectedSize && item.product.category && (
                      <p className="text-xs sm:text-sm text-theme-muted mb-2">Size: {item.selectedSize}</p>
                    )}
                    <p className="text-sm sm:text-base font-semibold text-theme-primary mb-3 sm:mb-4">
                      ₹{item.product.price.toLocaleString()}
                    </p>
                    <div className="flex items-center justify-between gap-3 sm:gap-4">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <button
                          onClick={() => handleQuantityUpdate(item.id, -1)}
                          disabled={isUpdating} // Disable button while updating
                          className={`w-8 h-8 sm:w-9 sm:h-9 border text-theme-primary border-theme-surface rounded-lg flex items-center justify-center text-sm hover:bg-theme-surface transition-colors ${baseFocusClasses}`}
                          title="Decrease quantity"
                        >
                          <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        <span className="text-sm sm:text-base w-8 text-center text-theme-primary font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityUpdate(item.id, +1)}
                          disabled={isUpdating} // Disable button while updating
                          className={`w-8 h-8 sm:w-9 sm:h-9 border text-theme-primary border-theme-surface rounded-lg flex items-center justify-center text-sm hover:bg-theme-surface transition-colors ${baseFocusClasses}`}
                          title="Increase quantity"
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={isUpdating} // Disable remove button too
                        className={`text-xs sm:text-sm text-theme-muted hover:text-red-500 transition-colors ${baseFocusClasses}`}
                        title={`Remove ${item.product.name}`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {activeItems.length > 0 && (
          <div
            className={`border-t border-theme-surface p-4 sm:p-6 bg-theme-light transition-opacity duration-700 sticky bottom-0 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
          >
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <span className="text-sm sm:text-base text-theme-primary font-semibold">SUBTOTAL:</span>
              <span className="text-sm sm:text-base text-theme-primary font-semibold">₹{getTotalPrice().toLocaleString()}</span>
            </div>
            <p className="text-xs sm:text-sm text-theme-muted mb-4 sm:mb-6">
              Taxes and shipping fee will be calculated at checkout.
            </p>
            <button
              onClick={handleCheckout}
              disabled={isUpdating} // Disable checkout button too
              className={`w-full bg-theme-primary text-theme-light py-3 sm:py-4 text-sm sm:text-base rounded-lg font-medium hover:bg-theme-dark transition-colors ${baseFocusClasses}`}
              title="Proceed to checkout"
            >
              {isAuthenticated ? 'PROCEED TO CHECKOUT' : 'LOGIN TO CHECKOUT'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;