import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { SITE_CONFIG, staticImageBaseUrl } from '../../constants/siteConfig';
import LoginPromptModal from './LoginPromptModal';
import { apiService } from '../../services/api';

interface ProductCardProps {
  product: Product;
  showQuickView?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [category, setCategory] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const { addItem, items, removeItem } = useCartStore();

  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const baseFocusClasses = "focus:outline-none focus:ring-0";

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const categories = await apiService.getCategories();
        const productCategory = categories.find(cat => cat.name === product.category);
        setCategory(productCategory);
      } catch (error) {
        console.error('Error loading category:', error);
      }
    };
    loadCategory();
  }, [product.category]);

  const hasSizeOptions = category?.sizeOptions?.length > 0;
  const existingCartItem = items.find(
    item => item.productId === product.id
  );

  const effectiveSelectedSize = hasSizeOptions
    ? (selectedSize || existingCartItem?.selectedSize)
    : undefined;


  const cartItem = items.find(
    item => item.productId === product.id &&
      (item.selectedSize ?? '') === (effectiveSelectedSize ?? '')
  );


  const inCart = !!cartItem;

  const productImages = product.images?.length
    ? product.images.map(img => (img.startsWith('http') ? img : staticImageBaseUrl + img))
    : ['https://www.macsjewelry.com/cdn/shop/files/IMG_4360_594x.progressive.jpg?v=1701478772'];

  const hasSecondImage = productImages.length > 1;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return setShowLoginPrompt(true);
    if (hasSizeOptions && !selectedSize) return setShowSizeSelector(true);
    if (!product.stock || isUpdating) return;

    setIsUpdating(true);
    try {
      await addItem(product, 1, effectiveSelectedSize);
    } catch (error) {
      console.error("Failed to add item to cart:", error);
    } finally {
      setIsUpdating(false);
    }
  };


  const handleSizeSelect = async (size: string) => {
    setSelectedSize(size);
    setShowSizeSelector(false);
    setIsUpdating(true);
    try {
      await addItem(product, 1, size);
    } catch (error) {
      console.error("Failed to add item with selected size:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <article
        className="group bg-theme-surface rounded-2xl p-4 transition-all duration-300 hover:shadow-md w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/product/${product.slug || product.id}`} className={`block mb-3 ${baseFocusClasses}`}>
          <div className="relative aspect-square overflow-hidden rounded-xl bg-theme-light">
            <img
              src={productImages[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-opacity duration-500"
              style={{ opacity: hasSecondImage && isHovered ? 0 : 1 }}
              loading="lazy"
            />
            {hasSecondImage && (
              <img
                src={productImages[1]}
                alt={`${product.name} - alternate view`}
                className="absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500"
                style={{ opacity: isHovered ? 1 : 0 }}
                loading="lazy"
              />
            )}
            {!product.stock && (
              <div className="absolute top-3 left-3 bg-theme-dark text-theme-light text-xs px-3 py-1 rounded-full font-medium">
                SOLD OUT
              </div>
            )}
          </div>
        </Link>

        <div className="text-center space-y-2">
          <Link to={`/product/${product.slug || product.id}`} className={baseFocusClasses}>
            <h3 className="font-serif text-lg text-theme-primary hover:text-theme-muted transition-colors line-clamp-2 leading-tight">
              {product.name}
            </h3>
          </Link>

          <div className="flex items-center justify-center gap-2">
            <span className="font-serif text-theme-primary font-medium">
              {SITE_CONFIG.currencySymbol}{(product.price || 0).toLocaleString()}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-sm text-theme-muted line-through font-serif">
                {SITE_CONFIG.currencySymbol}{product.comparePrice.toLocaleString()}
              </span>
            )}
          </div>

          <div className="pt-2">
            {!product.stock ? (
              <button
                disabled
                className={`w-full mt-4 py-3 text-xs font-serif font-semibold italic border-2 border-theme-muted text-theme-muted rounded-xl cursor-not-allowed ${baseFocusClasses}`}
              >
                OUT OF STOCK
              </button>
            ) : inCart ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4 w-full">
                <div className="w-full sm:w-auto">
                  <Link
                    to="/cart"
                    className={`block w-full px-6 py-3 text-xs font-serif font-semibold italic border-2 border-theme-primary text-theme-primary rounded-xl hover:bg-theme-primary hover:text-theme-light transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md text-center ${baseFocusClasses}`}
                  >
                    Go to Cart
                  </Link>
                </div>
                <div className="w-full sm:w-auto">
                  <button
                    onClick={() => removeItem(cartItem!.id)}
                    className={`w-full px-6 py-3 text-xs font-serif font-semibold italic border-2 border-red-600 text-red-600 rounded-xl hover:bg-red-600 hover:text-theme-light transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md ${baseFocusClasses}`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                className={`w-full mt-4 py-3 text-xs font-serif font-semibold italic border-2 border-theme-primary text-theme-primary rounded-xl hover:bg-theme-primary hover:text-theme-light transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md ${baseFocusClasses}`}
                title="Add to Cart"
              >
                Preorder
              </button>
            )}

          </div>
        </div>
      </article>

      {/* Size Selector */}
      {showSizeSelector && hasSizeOptions && (
        <div className="fixed inset-0 z-50 bg-theme-dark bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-theme-light rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-serif text-theme-primary mb-4 text-center">Select Size</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {category.sizeOptions.map((size: string) => (
                <button
                  key={size}
                  onClick={() => handleSizeSelect(size)}
                  className={`py-3 px-4 border border-theme-surface rounded-xl text-sm font-serif text-theme-primary hover:border-theme-primary hover:bg-theme-surface ${baseFocusClasses}`}
                >
                  {size}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowSizeSelector(false)}
              className={`w-full py-2 text-sm text-theme-muted hover:text-theme-primary font-serif ${baseFocusClasses}`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Login Prompt */}
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
