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
  }, [product, selectedSize]);

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

  const productQuantity = product ? getProductQuantity(product.id, selectedSize) : 0;
  const inCart = product ? isProductInCart(product.id, selectedSize) : false;
  const hasSizeOptions = category?.sizeOptions?.length > 0;

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
      addItem(product, 1, selectedSize);
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

  const handleQuantityChange = (e: React.MouseEvent, change: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    if (!product) return;

    const newQuantity = productQuantity + change;

    const item = useCartStore.getState().items.find(item =>
      item.productId === product.id && item.selectedSize === selectedSize
    );

    if (newQuantity <= 0 && item) {
      removeItem(item.id);
    } else if (item) {
      updateQuantity(item.id, newQuantity, selectedSize);
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
        <div className="min-h-screen bg-subtle-beige text-rich-brown font-serif flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold italic mb-2">Product Not Found</h2>
            <p className="italic mb-8">The product you're looking for doesn't exist.</p>
            <Link to="/products" className="bg-rich-brown text-white px-8 py-3 rounded font-semibold italic hover:bg-opacity-90 transition-colors">
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

      <div className="min-h-screen bg-subtle-beige text-rich-brown font-serif">
        <div className="container mx-auto mt-[83px] px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="relative bg-gray-100 lg:ml-24">
                <div className="aspect-square">
                  <img src={productImages[currentImageIndex]} alt={product.name} className="w-full h-full object-cover" />
                </div>
                {productImages.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:shadow-lg">
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button onClick={nextImage} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:shadow-lg">
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <h1 className="text-3xl italic font-semibold text-rich-brown">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-xl font-medium">₹ {product.price.toLocaleString()}</div>
                {product.comparePrice && product.comparePrice > product.price && (
                  <div className="text-lg line-through text-rich-brown/60">
                    ₹ {product.comparePrice.toLocaleString()}
                  </div>
                )}
              </div>

              {hasSizeOptions && (
                <div className="space-y-2">
                  <label className="block text-sm italic">Size <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-4 gap-2">
                    {category.sizeOptions.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-2 px-3 border rounded-md text-sm transition-colors italic ${selectedSize === size
                            ? 'border-rich-brown bg-rich-brown text-white'
                            : 'border-rich-brown/40 text-rich-brown hover:border-rich-brown'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {product.stock && inCart && (
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={(e) => handleQuantityChange(e, -1)}
                    className="w-8 h-8 border flex items-center justify-center"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center">{productQuantity}</span>
                  <button
                    onClick={(e) => handleQuantityChange(e, 1)}
                    className="w-8 h-8 border flex items-center justify-center"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={!product.stock}
                className="w-full mt-4 bg-rich-brown text-white py-3 px-6 font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50"
              >
                {product.stock ? (inCart ? 'CONFIRM ADD TO CART' : 'ADD TO CART') : 'OUT OF STOCK'}
              </button>

              <div className="pt-6 border-t border-rich-brown/20">
                <div className="flex space-x-6 border-b border-rich-brown/20 mb-4">
                  {['About', 'Details', 'Shipping', 'Reviews'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setTab(tab as any)}
                      className={`pb-2 italic font-semibold uppercase tracking-wide text-sm ${currentTab === tab ? 'border-b-2 border-rich-brown text-rich-brown' : 'text-rich-brown/70 hover:text-rich-brown'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="text-sm leading-relaxed italic">
                  {currentTab === 'About' && <p>{product.description}</p>}
                  {currentTab === 'Details' && (
                    <p>
                      Net Weight: 16oz (1 lb) / 454g<br />
                      Shelf Life: 12 months from manufacturing date<br />
                      Storage: Keep in a cool, dry place<br />
                      Allergen info: Contains wheat
                    </p>
                  )}
                  {currentTab === 'Shipping' && (
                    <p>
                      We offer free shipping across India. Estimated delivery time is 3–7 business days. International shipping is available with additional cost.
                    </p>
                  )}
                  {currentTab === 'Reviews' && (
                    <p>
                      ★★★★★<br />
                      "Absolutely stunning piece! Quality and craftsmanship exceeded my expectations."
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