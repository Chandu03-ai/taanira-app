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
    } catch (error) {
      console.error('Error loading product:', error);
      setProduct(null);
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
      removeItem(product.id);
    } else {
      updateQuantity(product.id, change);
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

              {/* Quantity Controls (Only if inCart and stock available) */}
              {product.stock && inCart && (
                <div className="flex items-center justify-start space-x-4 py-3 relative">
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
              )}

              {/* Add to Cart / Preorder Button */}
              {!product.stock ? (
                <button
                  disabled
                  className="w-full py-3 text-xs font-serif font-semibold italic border-2 border-gray-400 text-gray-400 rounded-xl cursor-not-allowed focus:outline-none"
                >
                  OUT OF STOCK
                </button>
              ) : inCart ? (
                <button
                  onClick={handleAddToCart} // Keep the animation for "ADDED!"
                  className="w-full py-3 text-xs font-serif font-semibold italic border-2 border-rich-brown text-rich-brown rounded-xl hover:bg-rich-brown hover:text-white transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md focus:outline-none"
                  title="Confirm to Preorder"
                >
                  CONFIRM TO PREORDER
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="w-full sm:w-60 px-6 py-3 text-xs font-serif font-semibold italic border-2 border-rich-brown text-rich-brown rounded-xl hover:bg-rich-brown hover:text-white transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md focus:outline-none"
                  title="Preorder"
                >
                  PREORDER
                </button>
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