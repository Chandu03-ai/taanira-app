import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Minus } from 'lucide-react';
import { Product } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { SITE_CONFIG, staticImageBaseUrl } from '../../constants/siteConfig';
import LoginPromptModal from './LoginPromptModal';

interface ProductCardProps {
  product: Product;
  showQuickView?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, showQuickView = true }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const { addItem, updateQuantity, removeItem, getProductQuantity, isProductInCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const { syncWithServer } = useCartStore.getState();
    syncWithServer();
  }, []);

  const productQuantity = getProductQuantity(product.id);
  const inCart = isProductInCart(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    if (product.stock) {
      addItem(product, 1);
      const button = e.currentTarget as HTMLButtonElement;
      const originalText = button.textContent;
      button.textContent = 'ADDED!';
      button.style.backgroundColor = '#10b981';
      setTimeout(() => {
        button.textContent = originalText!;
        button.style.backgroundColor = '';
      }, 1200);
    }
  };

  const handleQuantityChange = (e: React.MouseEvent, change: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    const newQuantity = productQuantity + change;

    if (newQuantity <= 0) {
      removeItem(product.id);
    } else {
      updateQuantity(product.id, change);
    }
  };

  // Image navigation functions omitted here for brevity (same as before)...

  const productImages = product.images?.length
    ? product.images.map((img) => (img.startsWith('http') ? img : staticImageBaseUrl + img))
    : ['https://www.macsjewelry.com/cdn/shop/files/IMG_4360_594x.progressive.jpg?v=1701478772'];

  return (
    <>
      <article className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 ease-in-out border border-subtle-beige overflow-hidden transform hover:scale-[1.02] w-full max-w-sm mx-auto">
        {/* ...all your existing JSX unchanged, including Preorder button... */}

        <Link to={`/product/${product.slug || product.id}`}>
          <div
            className="relative overflow-hidden bg-gray-100 aspect-[3/4] sm:aspect-[4/5]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <img
              src={productImages[currentImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-200 ease-in-out group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-rich-brown/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out" />

            {productImages.length > 1 && isHovered && (
              <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
                  }}
                  className="p-1.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm hover:bg-white hover:shadow-md transition-all duration-200 ease-in-out"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
                  }}
                  className="p-1.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm hover:bg-white hover:shadow-md transition-all duration-200 ease-in-out"
                  aria-label="Next"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {!product.stock && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-3 py-1 rounded-xl font-serif font-semibold italic">
                Out of Stock
              </div>
            )}

            {showQuickView && (
              <button
                className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-rich-brown/90 backdrop-blur-sm text-white px-4 py-2 text-xs font-serif italic opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out translate-y-2 group-hover:translate-y-0 rounded-xl hover:bg-rich-brown"
                title="Quick View Product"
              >
                Quick View
              </button>
            )}
          </div>
        </Link>

        <div className="p-4 sm:p-5">
          <div className="text-center">
            <Link to={`/product/${product.slug || product.id}`}>
              <h3 className="text-xs sm:text-sm font-serif font-semibold italic text-rich-brown hover:text-mocha line-clamp-2 mb-3 transition-all duration-200 ease-in-out leading-tight min-h-[2.5rem]">
                {product.name}
              </h3>
            </Link>

            <hr className="my-3 border-t border-subtle-beige w-3/4 mx-auto" />

            <div className="flex items-center justify-center space-x-2 mt-2 mb-4">
              <span className="text-sm sm:text-base font-serif font-semibold text-rich-brown">
                {SITE_CONFIG.currencySymbol} {(product.price || 0).toLocaleString()}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-xs text-mocha/60 line-through font-serif italic">
                  {SITE_CONFIG.currencySymbol} {product.comparePrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {!product.stock ? (
            <button
              disabled
              className="w-full py-3 text-xs font-serif font-semibold italic border-2 border-gray-400 text-gray-400 rounded-xl cursor-not-allowed"
            >
              OUT OF STOCK
            </button>
          ) : inCart ? (
            <div className="flex items-center justify-center space-x-4 py-3 relative">
              <button
                onClick={(e) => handleQuantityChange(e, -1)}
                className="w-8 h-8 flex items-center justify-center border-2 border-rich-brown text-rich-brown rounded-xl hover:bg-rich-brown hover:text-white transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
                aria-label="Decrease quantity"
                title="Decrease quantity"
              >
                <Minus className="w-3 h-3" />
              </button>

              <span className="text-base font-serif font-semibold text-rich-brown min-w-[2rem] text-center">
                {productQuantity}
              </span>

              <button
                onClick={(e) => handleQuantityChange(e, 1)}
                className="w-8 h-8 flex items-center justify-center border-2 border-rich-brown text-rich-brown rounded-xl hover:bg-rich-brown hover:text-white transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
                aria-label="Increase quantity"
                title="Increase quantity"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="w-full py-3 text-xs font-serif font-semibold italic border-2 border-rich-brown text-rich-brown rounded-xl hover:bg-rich-brown hover:text-white transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
              title="Preorder"
            >
              Preorder 
            </button>
          )}
        </div>
      </article>

      {/* Modal Popup for login prompt */}
      {showLoginPrompt && (
        <LoginPromptModal
          show={showLoginPrompt}
          onClose={() => setShowLoginPrompt(false)}
          onLogin={() => {
            setShowLoginPrompt(false);
            navigate('/login');
          }}
        />
      )}
    </>
  );
};

export default ProductCard;
