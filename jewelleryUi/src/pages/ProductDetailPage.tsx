import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { apiService } from '../services/api';
import { useCartStore } from '../store/cartStore'; // Correct import
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SEOHead from '../components/seo/SEOHead';
import { SITE_CONFIG, staticImageBaseUrl } from '../constants/siteConfig';
import LoginPromptModal from '../components/common/LoginPromptModal';

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentTab, setTab] = useState<'About' | 'Details' | 'Shipping' | 'Reviews'>('About');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [category, setCategory] = useState<any>(null);

  // CORRECTED: Destructure the state (items) and actions from useCartStore using a selector
  const addItem = useCartStore(state => state.addItem);
  const removeItem = useCartStore(state => state.removeItem);
  const items = useCartStore(state => state.items); // <--- Select 'items' here

  const { isAuthenticated } = useAuthStore();
  const baseFocusClasses = "focus:outline-none focus:ring-0";

  useEffect(() => {
    if (slug) loadProduct();
  }, [slug]);

  useEffect(() => {
    const loadCategory = async () => {
      if (product) {
        try {
          const categories = await apiService.getCategories();
          const productCategory = categories.find(cat => cat.name === product.category);
          setCategory(productCategory);
        } catch (error) {
          console.error('Error loading category:', error);
        }
      }
    };
    loadCategory();
  }, [product]); // Removed selectedSize from dependency array as it's not needed for category loading

  const loadProduct = async () => {
    try {
      const productData = await apiService.getProductBySlug(slug!);
      setProduct(productData);
      // Reset selected size when a new product is loaded (good practice)
      setSelectedSize('');
    } catch (error) {
      console.error('Error loading product:', error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const hasSizeOptions = category?.sizeOptions && Array.isArray(category.sizeOptions) && category.sizeOptions.length > 0;
  // Determine the effective size to pass to cart functions:
  // Use selectedSize if product has size options, otherwise use undefined for "no size"
  const existingCartItem = product ? items.find(
    item => item.productId === product.id
  ) : undefined;

  const effectiveSelectedSize = hasSizeOptions
    ? (selectedSize || existingCartItem?.selectedSize)
    : undefined;

  const cartItem = product ? items.find(
    item => item.productId === product.id &&
      (item.selectedSize ?? '') === (effectiveSelectedSize ?? '')
  ) : undefined;

  const inCart = !!cartItem;



  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    if (hasSizeOptions && !selectedSize) {
      alert('Please select a size before adding to cart');
      return;
    }

    if (product && product.stock) {
      addItem(product, 1, effectiveSelectedSize);
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

  const handleLogin = () => {
    setShowLoginPrompt(false);
    navigate('/login');
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
        <div className="min-h-screen bg-theme-background text-theme-primary font-serif flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold italic mb-2">Product Not Found</h2>
            <p className="italic mb-8">The product you're looking for doesn't exist.</p>
            <Link to="/products" className={`bg-theme-primary text-theme-light px-8 py-3 rounded font-semibold italic hover:bg-theme-dark transition-colors ${baseFocusClasses}`}>
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
        title={`${product.name} - ${SITE_CONFIG.name}`}
        description={
          product.description ||
          `Buy ${product.name} - Handcrafted pure silver jewelry from ${SITE_CONFIG.name}.`
        }
        keywords={`${product.name}, ${product.category}, silver jewelry, handcrafted, ${SITE_CONFIG.name}`}
        image={productImages?.[0] || '/images/default-product.png'}
        type="product"
        productData={{
          name: product.name,
          price: product.price,
          currency: 'INR',
          availability: product.stock ? 'InStock' : 'OutOfStock',
          brand: SITE_CONFIG.name,
          category: product.category,
        }}
      />

      <div className="min-h-screen bg-theme-background text-theme-primary font-serif">
        <div className="container mx-auto pt-20 sm:pt-24 lg:pt-28 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 xl:gap-16">
            {/* Image Section */}
            <div className="space-y-4 sm:space-y-6">
              <div className="relative bg-theme-surface rounded-xl sm:rounded-2xl overflow-hidden">
                <div className="aspect-square">
                  <img 
                    src={productImages[currentImageIndex]} 
                    alt={product.name} 
                    className="w-full h-full object-cover rounded-xl sm:rounded-2xl" 
                  />
                </div>
                {productImages.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage} 
                      className={`absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-theme-light rounded-full p-2 sm:p-3 shadow-md hover:shadow-lg ${baseFocusClasses}`}
                    >
                      <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                    <button 
                      onClick={nextImage} 
                      className={`absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-theme-light rounded-full p-2 sm:p-3 shadow-md hover:shadow-lg ${baseFocusClasses}`}
                    >
                      <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Thumbnail Images for larger screens */}
              {productImages.length > 1 && (
                <div className="hidden sm:flex gap-2 lg:gap-3 overflow-x-auto">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        currentImageIndex === index ? 'border-theme-primary' : 'border-theme-surface hover:border-theme-secondary'
                      }`}
                    >
                      <img 
                        src={image} 
                        alt={`${product.name} view ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info Section */}
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl italic font-semibold text-theme-primary leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-medium">₹ {product.price.toLocaleString()}</div>
                {product.comparePrice && product.comparePrice > product.price && (
                    <div className="text-lg sm:text-xl lg:text-2xl line-through text-theme-primary/60">
                    ₹ {product.comparePrice.toLocaleString()}
                  </div>
                )}
                </div>
              </div>

              {hasSizeOptions && (
                <div className="space-y-3 sm:space-y-4">
                  <label className="block text-sm sm:text-base italic font-medium">
                    Size <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                    {category.sizeOptions.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-2.5 sm:py-3 px-3 sm:px-4 border rounded-lg text-sm sm:text-base transition-colors italic ${baseFocusClasses} ${selectedSize === size
                          ? 'border-theme-primary bg-theme-primary text-theme-light'
                          : 'border-theme-primary/40 text-theme-primary hover:border-theme-primary'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 sm:space-y-4">
              {!product.stock ? (
                <button
                  disabled
                  className={`w-full py-3 sm:py-4 text-sm sm:text-base font-serif font-semibold italic border-2 border-theme-muted text-theme-muted rounded-xl cursor-not-allowed ${baseFocusClasses}`}
                >
                  OUT OF STOCK
                </button>
              ) : inCart ? (
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                  <Link
                    to="/cart"
                    className={`w-full sm:flex-1 text-center py-3 sm:py-4 text-sm sm:text-base font-serif font-semibold italic border-2 border-theme-primary text-theme-primary rounded-xl hover:bg-theme-primary hover:text-theme-light transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md ${baseFocusClasses}`}
                  >
                    Go to Cart
                  </Link>

                  <button
                    onClick={() => removeItem(cartItem.id)}
                    className={`w-full sm:flex-1 py-3 sm:py-4 text-sm sm:text-base font-serif font-semibold italic border-2 border-red-500 text-red-500 rounded-xl hover:bg-red-500 hover:text-theme-light transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md ${baseFocusClasses}`}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className={`w-full py-3 sm:py-4 text-sm sm:text-base font-serif font-semibold italic border-2 border-theme-primary text-theme-primary rounded-xl hover:bg-theme-primary hover:text-theme-light transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md ${baseFocusClasses}`}
                  title="Add to Cart"
                >
                  Preorder
                </button>
              )}
              </div>

              {/* Product Details Tabs */}
              <div className="pt-6 sm:pt-8 border-t border-theme-primary/20">
                <div className="flex flex-wrap gap-2 sm:gap-4 lg:gap-6 border-b border-theme-primary/20 mb-4 sm:mb-6">
                  {['About', 'Details', 'Shipping', 'Reviews'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setTab(tab as any)}
                      className={`pb-2 sm:pb-3 italic font-semibold uppercase tracking-wide text-xs sm:text-sm lg:text-base ${baseFocusClasses} ${
                        currentTab === tab 
                          ? 'border-b-2 border-theme-primary text-theme-primary' 
                          : 'text-theme-primary/70 hover:text-theme-primary'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="text-sm sm:text-base leading-relaxed italic text-theme-primary/90">
                  {currentTab === 'About' && <p>{product.description}</p>}
                  {currentTab === 'Details' && (
                    <p>
                      {product.details}
                    </p>
                  )}
                  {currentTab === 'Shipping' && (
                    <p>
                      We offer free shipping across India. As all our pieces are handmade and handloom-crafted, delivery timelines depend on preorder fulfillment.
                    </p>
                  )}
                  {currentTab === 'Reviews' && (
                    <p>
                      {product.review}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

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