import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WishlistItem, Product } from '../types';
import { useAuthStore } from './authStore';

interface WishlistState {
  items: WishlistItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  syncWithServer: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const { isAuthenticated } = useAuthStore.getState();
        const items = get().items;
        const existingItem = items.find(item => item.productId === product.id);
        
        if (!existingItem) {
          set({
            items: [...items, {
              id: `${product.id}-${Date.now()}`,
              productId: product.id,
              product,
            }],
          });
          
          if (isAuthenticated) {
            // userService.addToWishlist(product.id).catch(console.error);
          }
        }
      },
      removeItem: (productId) => {
        const { isAuthenticated } = useAuthStore.getState();
        set({
          items: get().items.filter(item => item.productId !== productId),
        });
        
        if (isAuthenticated) {
          // userService.removeFromWishlist(productId).catch(console.error);
        }
      },
      isInWishlist: (productId) => {
        return get().items.some(item => item.productId === productId);
      },
      clearWishlist: () => set({ items: [] }),
      syncWithServer: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) return;
        
        try {
          // const serverWishlist = await userService.getUserWishlist();
          // Convert product IDs to wishlist items (would need product data)
          // This is a simplified version - in practice, you'd fetch product details
          // const wishlistItems: WishlistItem[] = (serverWishlist.result || []).map(productId => ({
          //   id: `${productId}-server`,
          //   productId,
          //   product: {} as Product, // Would need to fetch product details
          // }));
          
          // set({ items: wishlistItems });
        } catch (error) {
          console.error('Failed to sync wishlist with server:', error);
        }
      },
    }),
    {
      name: 'wishlist-storage',
    }
  )
);