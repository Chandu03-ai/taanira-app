import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { staticImageBaseUrl } from '../constants/siteConfig';

const WishlistPage: React.FC = () => {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem } = useCartStore();

  const handleAddToCart = (product: any) => {
    addItem(product, 1);
    alert(`Added ${product.name} to cart!`);
  };

  const handleRemoveFromWishlist = (productId: string, productName: string) => {
    if (confirm(`Remove ${productName} from wishlist?`)) {
      removeItem(productId);
    }
  };

  const handleClearWishlist = () => {
    if (confirm('Are you sure you want to clear your entire wishlist?')) {
      clearWishlist();
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Wishlist is Empty</h2>
          <p className="text-gray-600 mb-8">Save your favorite jewelry pieces to your wishlist!</p>
          <Link
            to="/products"
            className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            My Wishlist ({items.length} items)
          </h1>
          <button
            onClick={handleClearWishlist}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Clear Wishlist
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden group">
              <div className="relative">
                <Link to={`/product/${item.product.slug || item.product.id}`}>
                  <img
                    src={item.product.images[0]?.startsWith('http') 
                      ? item.product.images[0] 
                      : `${staticImageBaseUrl}${item.product.images[0]}` || 'https://www.macsjewelry.com/cdn/shop/files/IMG_4360_594x.progressive.jpg?v=1701478772'}
                    alt={item.product.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                
             

                {/* Remove from wishlist button */}
                <button
                  onClick={() => handleRemoveFromWishlist(item.productId, item.product.name)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                >
                  <Heart className="h-4 w-4 text-red-500 fill-current" />
                </button>
              </div>

              <div className="p-4">
                <Link to={`/product/${item.product.slug || item.product.id}`}>
                  <h3 className="font-semibold text-gray-800 hover:text-purple-600 transition-colors line-clamp-2">
                    {item.product.name}
                  </h3>
                </Link>
                
              

                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => handleAddToCart(item.product)}
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Add to Cart</span>
                  </button>
                  <button
                    onClick={() => handleRemoveFromWishlist(item.productId, item.product.name)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <Heart className="h-4 w-4 text-red-500" />
                  </button>
                </div>

                <div className="mt-3 text-sm text-gray-500">
                  <span>Check delivery date</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;