import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { staticImageBaseUrl } from '../../constants/siteConfig';

interface CartSidebarProps {
  onClose: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ onClose }) => {
  const {
    items,
    removeItem,
    updateQuantity,
    getTotalPrice,
    syncWithServer
  } = useCartStore();

  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); // State to manage update loading

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
    navigate('/cart');
  };

  const handleQuantityUpdate = async (id: string, delta: number) => {
    if (isUpdating) return; // Prevent multiple clicks while an update is in progress

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

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

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
        <div className="absolute right-0 top-0 h-full w-full max-w-xs sm:max-w-sm lg:max-w-md bg-white shadow-xl flex flex-col items-center justify-center text-center px-4">
          <ShoppingBag className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-600 text-sm sm:text-base mb-2">You need to be logged in to access your cart.</p>
          <button
            onClick={() => {
              onClose();
              navigate('/login');
            }}
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
          >
            Login to Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden lg:overflow-visible">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

      <div className="absolute right-0 top-0 h-full w-full max-w-xs sm:max-w-sm lg:max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <h2 className="text-base sm:text-lg font-semibold text-black truncate">
            MY BAG ({items.length})
          </h2>
          <button
            onClick={onClose}
            className="hover:opacity-70 transition-opacity text-black p-1 rounded-full hover:bg-gray-100"
            title="Close cart"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div
          className={`flex-1 overflow-y-auto p-4 transition-opacity duration-700 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {items.length === 0 ? (
            <div className="text-center mt-8 animate-fadeInSlow">
              <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Your bag is empty</p>
              <Link
                to="/products"
                onClick={onClose}
                className="inline-block mt-4 bg-black text-white px-6 py-2 text-sm rounded hover:bg-gray-800 transition-colors"
                title="Start shopping"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-start space-x-3 border-b border-gray-100 pb-4 last:border-b-0 animate-fadeInSlow"
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
                    className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 leading-tight">
                      {item.product.name}
                    </h3>
                    {item.selectedSize && item.product.category && (
                      <p className="text-xs text-gray-500 mb-1">Size: {item.selectedSize}</p>
                    )}
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      ₹{item.product.price.toLocaleString()}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityUpdate(item.id, -1)}
                          disabled={isUpdating} // Disable button while updating
                          className="w-7 h-7 border text-black border-gray-300 rounded flex items-center justify-center text-sm hover:bg-gray-50 transition-colors"
                          title="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="text-sm w-6 text-center text-black font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityUpdate(item.id, +1)}
                          disabled={isUpdating} // Disable button while updating
                          className="w-7 h-7 border text-black border-gray-300 rounded flex items-center justify-center text-sm hover:bg-gray-50 transition-colors"
                          title="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={isUpdating} // Disable remove button too
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
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

        {items.length > 0 && (
          <div
            className={`border-t border-gray-200 p-4 bg-white transition-opacity duration-700 sticky bottom-0 ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-black font-semibold">SUBTOTAL:</span>
              <span className="text-sm text-black font-semibold">₹{getTotalPrice().toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Taxes and shipping fee will be calculated at checkout.
            </p>
            <button
              onClick={handleCheckout}
              disabled={isUpdating} // Disable checkout button too
              className="w-full bg-black text-white py-3 text-sm rounded font-medium hover:bg-gray-800 transition-colors mb-2"
              title="Proceed to checkout"
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;