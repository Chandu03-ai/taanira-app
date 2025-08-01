import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { apiService } from '../services/api';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SEOHead from '../components/seo/SEOHead';
import { SITE_CONFIG, staticOriginalImageBaseUrl } from '../constants/siteConfig';
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
  const [isUpdatingCart, setIsUpdatingCart] = useState(false);

  const addItem = useCartStore(state => state.addItem);
  const removeItem = useCartStore(state => state.removeItem);
  const items = useCartStore(state => state.items);
  const guestItems = useCartStore(state => state.guestItems);

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
  }, [product]);

  const loadProduct = async () => {
    try {
      const productData = await apiService.getProductBySlug(slug!);
      setProduct(productData);
      setSelectedSize('');
    } catch (error) {
      console.error('Error loading product:', error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const hasSizeOptions = category?.sizeOptions && Array.isArray(category.sizeOptions) && category.sizeOptions.length > 0;

  const activeItems = isAuthenticated ? items : guestItems;

  const existingCartItem = product ? activeItems.find(
    item => item.productId === product.id
  ) : undefined;

  const effectiveSelectedSize = hasSizeOptions
    ? (selectedSize || existingCartItem?.selectedSize)
    : undefined;

  const cartItem = product ? activeItems.find(
    item => item.productId === product.id &&
      (item.selectedSize ?? '') === (effectiveSelectedSize ?? '')
  ) : undefined;

  const inCart = !!cartItem;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasSizeOptions && !selectedSize) {
      alert('Please select a size before adding to cart');
      return;
    }

    if (!product || !product.stock || isUpdatingCart) return;

    setIsUpdatingCart(true);
    try {
      await addItem(product, 1, effectiveSelectedSize);
    } catch (error) {
      console.error("Failed to add item to cart:", error);
    } finally {
      setIsUpdatingCart(false);
    }
  };

  const handleRemoveFromCart = async () => {
    if (!cartItem || isUpdatingCart) return;

    setIsUpdatingCart(true);
    try {
      await removeItem(cartItem.id);
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
    } finally {
      setIsUpdatingCart(false);
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
        <div className="min-h-screen bg-theme-background text-theme-primary font-serif flex items-center justify-center px-4">
          <div className="text-center w-full max-w-md mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold italic mb-2">Product Not Found</h2>
            <p className="italic mb-8">The product you're looking for doesn't exist.</p>
            <Link to="/products" className={`bg-theme-primary text-theme-light px-6 sm:px-8 py-3 rounded font-semibold italic hover:bg-theme-dark transition-colors ${baseFocusClasses}`}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </>
    );
  }

  const productImages = product.images && product.images.length > 0
    ? product.images.map(img => img.startsWith('http') ? img : `${staticOriginalImageBaseUrl}/${img}`)
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
        {/* Centered container with max-width */}
        <div className="w-full max-w-7xl mx-auto pt-20 sm:pt-24 lg:pt-28 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 xl:gap-16">
            {/* Image Section */}
            <div className="space-y-4 sm:space-y-6">
              <div className="relative bg-theme-surface rounded-xl sm:rounded-2xl overflow-hidden">
                <div className="aspect-square">
                  <img
                    src={productImages[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className={`absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-theme-light rounded-full p-2 sm:p-3 shadow-md hover:shadow-lg transition-all ${baseFocusClasses}`}
                    >
                      <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className={`absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-theme-light rounded-full p-2 sm:p-3 shadow-md hover:shadow-lg transition-all ${baseFocusClasses}`}
                    >
                      <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Images */}
              {productImages.length > 1 && (
                <div className="flex gap-2 lg:gap-3 overflow-x-auto pb-2">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === index ? 'border-theme-primary' : 'border-theme-surface hover:border-theme-secondary'
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
            <div className="space-y-6 sm:space-y-8">
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-theme-primary leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-center space-x-4">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-semibold text-theme-dark">
                    ₹ {(product.price || 0).toLocaleString()}
                  </div>
                  {product.comparePrice && product.comparePrice > product.price && (
                    <div className="text-lg sm:text-xl lg:text-2xl line-through text-theme-muted">
                      ₹ {product.comparePrice.toLocaleString()}
                    </div>
                  )}
                </div>

                {product.isHalfPaymentAvailable && (
                  <div className="bg-theme-surface border border-theme-accent rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-serif italic text-theme-primary mb-3">
                      Half Payment Option Available
                    </h3>
                    <p className="text-theme-muted font-serif italic text-sm sm:text-base leading-relaxed">
                      This product supports 50% payment option. You can choose to pay{' '}
                      <span className="text-theme-dark font-semibold">
                        ₹{Math.round((product.price || 0) / 2).toLocaleString()}
                      </span>{' '}
                      now and the remaining{' '}
                      <span className="text-theme-dark font-semibold">
                        ₹{Math.round((product.price || 0) / 2).toLocaleString()}
                      </span>{' '}
                      after shipment.
                    </p>
                  </div>
                )}
              </div>

              {hasSizeOptions && (
                <div className="space-y-4">
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
              <div className="space-y-4">
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
                      className={`w-full sm:flex-[2] text-center py-3 sm:py-4 text-sm sm:text-base font-serif font-semibold italic border-2 border-theme-primary text-theme-primary rounded-xl hover:bg-theme-primary hover:text-theme-light transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md ${baseFocusClasses}`}
                    >
                      Go to Cart
                    </Link>
                    <button
                      onClick={handleRemoveFromCart}
                      disabled={isUpdatingCart}
                      className={`w-full sm:flex-1 py-3 sm:py-4 text-sm sm:text-base font-serif font-semibold italic border-2 border-red-500 text-red-500 rounded-xl hover:bg-red-500 hover:text-theme-light transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md ${baseFocusClasses} ${isUpdatingCart ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isUpdatingCart ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    disabled={isUpdatingCart}
                    className={`w-full py-3 sm:py-4 text-sm sm:text-base font-serif font-semibold italic border-2 border-theme-primary text-theme-primary rounded-xl hover:bg-theme-primary hover:text-theme-light transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md ${baseFocusClasses} ${isUpdatingCart ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Add to Cart"
                  >
                    {isUpdatingCart ? 'Adding...' : 'Preorder'}
                  </button>
                )}
              </div>

              {/* Product Details Tabs */}
              <div className="pt-6 sm:pt-8 border-t border-theme-primary/20">
                <div className="flex border-b text-sm sm:text-base overflow-x-auto">
                  {['About', 'Details', 'Shipping', 'Reviews'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setTab(tab as any)}
                      className={`pb-3 px-3 sm:px-4 border-b-2 transition whitespace-nowrap ${currentTab === tab ? 'border-theme-primary text-theme-primary' : 'border-transparent text-theme-muted hover:text-theme-primary'
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="pt-4 sm:pt-6 text-sm sm:text-base leading-relaxed italic text-theme-primary/90">
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