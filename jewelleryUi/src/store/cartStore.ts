import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '../types';
import { useAuthStore } from './authStore';
import { cartService } from '../services/cartService';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity: number, selectedSize?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedSize?: string) => void;
  updateItemSize: (productId: string, selectedSize: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
  getProductQuantity: (productId: string, selectedSize?: string) => number;
  isProductInCart: (productId: string, selectedSize?: string) => boolean;
  syncWithServer: () => Promise<void>;
  resetCartStore: () => void;
  getUniqueItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: async (product, quantity, selectedSize) => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) return;

        // Only use selectedSize if the product actually has size options
        const effectiveSize = selectedSize && product.category ? selectedSize : undefined;

        const state = get();
        const existingItem = state.items.find(item =>
          item.productId === product.id && item.selectedSize === effectiveSize
        );

        if (existingItem) {
          const updatedItems = state.items.map(item =>
            item.productId === product.id && item.selectedSize === effectiveSize
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
          set({ items: updatedItems });

          try {
            await cartService.updateCartItem(product.id, existingItem.quantity + quantity, effectiveSize);
            await get().syncWithServer();
          } catch (err) {
            console.error(err);
          }
        } else {
          const newItem: CartItem = {
            id: `${product.id}-${effectiveSize || 'no-size'}`,
            productId: product.id,
            quantity,
            selectedSize: effectiveSize,
            product,
          };

          set({ items: [...state.items, newItem] });

          try {
            await cartService.addToCart(product.id, quantity, effectiveSize);
            await get().syncWithServer();
          } catch (err) {
            console.error(err);
          }
        }
      },

      removeItem: async (itemId) => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) return;

        const item = get().items.find(item => item.id === itemId);
        if (!item) return;

        set({ items: get().items.filter(item => item.id !== itemId) });

        try {
          await cartService.removeFromCart(item.productId, item.selectedSize);
          await get().syncWithServer();
        } catch (err) {
          console.error(err);
        }
      },

      updateQuantity: (itemId, quantity) => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) return;

        const item = get().items.find(item => item.id === itemId);
        if (!item) return;

        const prevItems = get().items;
        const newItems = prevItems.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        );

        set({ items: newItems });

        cartService.updateCartItem(item.productId, quantity, item.selectedSize)
          .then(() => get().syncWithServer())
          .catch(err => console.error(err));
      },

      updateItemSize: async (itemId, selectedSize) => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) return;

        const item = get().items.find(item => item.id === itemId);
        if (!item) return;

        const updatedItems = get().items.map(item =>
          item.id === itemId ? { ...item, selectedSize, id: `${item.productId}-${selectedSize || 'no-size'}` } : item
        );

        set({ items: updatedItems });

        try {
          await cartService.updateCartItemSize(item.productId, selectedSize);
          await get().syncWithServer();
        } catch (err) {
          console.error(err);
        }
      },
      clearCart: () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
          set({ items: [] });
        }
      },


      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + (item.product?.price || 0) * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      getUniqueItemCount: () => {
        return get().items.length;
      },

      getProductQuantity: (productId: string, selectedSize?: string) => {
        // Only consider selectedSize if it's actually provided and meaningful
        const effectiveSize = selectedSize || undefined;
        return get().items.find(item =>
          item.productId === productId && item.selectedSize === effectiveSize
        )?.quantity || 0;
      },

      isProductInCart: (productId: string, selectedSize?: string) => {
        // Only consider selectedSize if it's actually provided and meaningful
        const effectiveSize = selectedSize || undefined;
        return get().items.some(item =>
          item.productId === productId && item.selectedSize === effectiveSize
        );
      },

      resetCartStore: () => {
        set({ items: [] });
      },

      syncWithServer: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) return;

        try {
          const response = await cartService.getCart();
          set({ items: response.result || [] });
        } catch (err) {
          console.error('Failed to sync cart:', err);
        }
      },
    }),
    {
      name: 'cart-storage',
      partialize: state => ({ items: state.items }), // persist only auth cart
    }
  )
);