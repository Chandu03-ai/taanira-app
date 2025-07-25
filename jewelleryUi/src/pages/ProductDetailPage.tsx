//ProductDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { Product } from '../types';
import { apiService } from '../services/api';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SEOHead from '../components/seo/SEOHead';
import { staticImageBaseUrl } from '../constants/siteConfig';
import LoginPromptModal from '../components/common/LoginPromptModal';

// Assuming SITE_CONFIG is defined somewhere and imported,
// or you can define it inline for the purpose of this component if not globally available.
// For example:
const SITE_CONFIG = {
  currencySymbol: '₹',
};


const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentTab, setTab] = useState<'About' | 'Details'>('About');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null); // New state for selected size

  const {
    addItem,
    removeItem,
    updateQuantity,
    getProductQuantity,
    isProductInCart
  } = useCartStore();

  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (slug) loadProduct();
  }, [slug]);

  const loadProduct = async () => {
    try {
      const productData = await apiService.getProductBySlug(slug!);
      setProduct(productData);
      // Set initial selected size if available
      if (productData.sizeOptions && productData.sizeOptions.length > 0) {
        setSelectedSize(productData.sizeOptions[0]);
      } else {
        setSelectedSize(null);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      setProduct(null);
      setSelectedSize(null);
    } finally {
      setLoading(false);
    }
  };

  const productQuantity = product ? getProductQuantity(product.id) : 0;
  const inCart = product ? isProductInCart(product.id) : false;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    if (product && product.stock) {
      // NOTE: For a full implementation, you'd likely pass `selectedSize` to `addItem`
      // and your cart store would need to be updated to handle product variations (e.g., id + size).
      addItem(product, 1);
      const button = e.currentTarget as HTMLButtonElement;
      const originalText = button.textContent;
      button.textContent = 'ADDED!';
      button.style.backgroundColor = '#10b981'; // Tailwind 'emerald-500' or similar green
      button.style.borderColor = '#10b981';
      setTimeout(() => {
        button.textContent = originalText!;
        button.style.backgroundColor = ''; // Revert to default or rich-brown
        button.style.borderColor = ''; // Revert border
      }, 1200);
    }
  };

  const handleLogin = () => {
    setShowLoginPrompt(false);
    navigate('/login');
  };

  const handleQuantityChange = (e: React.MouseEvent, change: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    if (!product) return;

    const newQuantity = productQuantity + change;

    if (newQuantity <= 0) {
      // NOTE: If cart store handles variations, `removeItem` would also need `selectedSize`
      removeItem(product.id);
    } else {
      // NOTE: If cart store handles variations, `updateQuantity` would also need `selectedSize`
      updateQuantity(product.id, change);
    }
  };

  const handleRemoveFromCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    if (product) {
      removeItem(product.id);
    }
  };

  const nextImage = () => {
    if (product?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!product) {
    return (
      <>
        <SEOHead title="Product Not Found - JI Jewelry" description="The product you're looking for doesn't exist." />
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
            <Link to="/products" className="bg-black text-white px-8 py-3 rounded font-semibold hover:bg-gray-800 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </>
    );
  }

  const productImages = product.images && product.images.length > 0
    ? product.images.map(img => img.startsWith('http') ? img : `${staticImageBaseUrl}/${img}`)
    : ['https://www.macsjewelry.com/cdn/shop/files/IMG_4360_594x.progressive.jpg?v=1701478772'];

  return (
    <>
      <SEOHead
        title={`${product.name} - JI Jewelry`}
        description={product.description || `Buy ${product.name} - Handcrafted pure silver jewelry from JI.`}
        keywords={`${product.name}, ${product.category}, silver jewelry, JI jewelry`}
        image={productImages[0]}
        type="product"
        productData={{
          name: product.name,
          price: product.price,
          currency: 'INR',
          availability: product.stock ? 'InStock' : 'OutOfStock',
          brand: 'JI',
          category: product.category
        }}
      />

      <div className="min-h-screen bg-white">
        <div className="container mx-auto mt-[150px] px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative bg-gray-100 lg:ml-24">
                <div className="aspect-square">
                  <img src={productImages[currentImageIndex]} alt={product.name} className="w-full h-full object-cover" />
                </div>
                {productImages.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:shadow-lg focus:outline-none">
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button onClick={nextImage} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:shadow-lg focus:outline-none">
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <h1 className="text-2xl font-serif font-light italic text-rich-brown">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-2xl font-serif font-semibold text-rich-brown">
                  {SITE_CONFIG.currencySymbol} {product.price.toLocaleString()}
                </div>
                {product.comparePrice && product.comparePrice > product.price && (
                  <div className="text-lg text-mocha/60 line-through font-serif italic">
                    {SITE_CONFIG.currencySymbol} {product.comparePrice.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Size Selector */}
              {product.sizeOptions && product.sizeOptions.length > 0 && (
                <div className="flex items-center space-x-2 py-3">
                  <span className="text-sm font-serif font-semibold text-rich-brown mr-2">Size:</span>
                  {product.sizeOptions.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`
                        w-10 h-10 flex items-center justify-center border-2 rounded-xl text-sm font-serif font-semibold
                        ${selectedSize === size
                          ? 'border-rich-brown bg-rich-brown text-white shadow-md'
                          : 'border-gray-300 text-gray-700 hover:border-rich-brown hover:text-rich-brown transition-colors duration-200'
                        }
                        focus:outline-none transform hover:scale-105 active:scale-95
                      `}
                      aria-label={`Select size ${size}`}
                      title={`Select size ${size}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}

              {/* Conditional Buttons based on stock and cart status */}
              {!product.stock ? (
                // OUT OF STOCK
                <button
                  disabled
                  className="w-full py-3 text-xs font-serif font-semibold italic border-2 border-gray-400 text-gray-400 rounded-xl cursor-not-allowed focus:outline-none"
                >
                  OUT OF STOCK
                </button>
              ) : ( // Product is in stock
                inCart ? (
                  // Product is IN CART
                  <div className="flex flex-col sm:flex-row items-center gap-4 py-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={(e) => handleQuantityChange(e, -1)}
                        className="w-8 h-8 flex items-center justify-center border-2 border-rich-brown text-rich-brown rounded-xl hover:bg-rich-brown hover:text-white transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-95 shadow-sm hover:shadow-md focus:outline-none"
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
                        className="w-8 h-8 flex items-center justify-center border-2 border-rich-brown text-rich-brown rounded-xl hover:bg-rich-brown hover:text-white transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-95 shadow-sm hover:shadow-md focus:outline-none"
                        aria-label="Increase quantity"
                        title="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Remove and View Cart buttons */}
                    <button
                      onClick={handleRemoveFromCart}
                      className="w-full sm:w-auto px-6 py-3 text-xs font-serif font-semibold italic border-2 border-red-500 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md focus:outline-none"
                      title="Remove from Cart"
                    >
                      REMOVE FROM CART
                    </button>
                    <Link
                      to="/cart"
                      className="w-full sm:w-auto px-6 py-3 text-xs font-serif font-semibold italic border-2 border-gray-700 text-gray-700 rounded-xl hover:bg-gray-700 hover:text-white transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md focus:outline-none text-center"
                    >
                      GO TO CART
                    </Link>
                  </div>
                ) : (
                  // Product is NOT IN CART
                  <button
                    onClick={handleAddToCart}
                    className="w-full sm:w-60 px-6 py-3 text-xs font-serif font-semibold italic border-2 border-rich-brown text-rich-brown rounded-xl hover:bg-rich-brown hover:text-white transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md focus:outline-none"
                    title="Preorder"
                    disabled={product.sizeOptions && product.sizeOptions.length > 0 && selectedSize === null}
                  >
                    PREORDER
                  </button>
                )
              )}
              {product.sizeOptions && product.sizeOptions.length > 0 && selectedSize === null && !inCart && product.stock && (
                <p className="text-red-500 text-sm italic">Please select a size.</p>
              )}

              <div className="pt-6 border-t border-subtle-beige">
                <div className="flex space-x-6 border-b border-subtle-beige mb-4">
                  {['About', 'Details'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setTab(tab as 'About' | 'Details')}
                      className={`pb-2 font-serif uppercase tracking-wide text-sm ${currentTab === tab ? 'border-b-2 border-rich-brown text-rich-brown' : 'text-mocha/60 hover:text-rich-brown'} focus:outline-none`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="text-sm text-mocha leading-relaxed font-serif italic">
                  {currentTab === 'About' && <p>{product.description}</p>}
                  {currentTab === 'Details' && (
                    <p>
                      {product.details}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🔒 Login Modal */}
        <LoginPromptModal
          show={showLoginPrompt}
          onClose={() => setShowLoginPrompt(false)}
          onLogin={handleLogin}
        />
      </div>
    </>
  );
};

export default ProductDetailPage;