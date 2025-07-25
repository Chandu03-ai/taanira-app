import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '../types';
import { useAuthStore } from './authStore';
import { cartService } from '../services/cartService';

interface CartState {
  items: CartItem[];

  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;

  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
  getProductQuantity: (productId: string) => number;
  isProductInCart: (productId: string) => boolean;
  syncWithServer: () => Promise<void>;
  resetCartStore: () => void;
  getUniqueItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: async (product, quantity) => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) return;

        const state = get();
        const existingItem = state.items.find(item => item.productId === product.id);

        if (existingItem) {
          const updatedItems = state.items.map(item =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
          set({ items: updatedItems });

          try {
            await cartService.updateCartItem(product.id, existingItem.quantity + quantity);
            await get().syncWithServer();
          } catch (err) {
            console.error(err);
          }
        } else {
          const newItem: CartItem = {
            id: product.id,
            productId: product.id,
            quantity,
            product,
          };

          set({ items: [...state.items, newItem] });

          try {
            await cartService.addToCart(product.id, quantity);
            await get().syncWithServer();
          } catch (err) {
            console.error(err);
          }
        }
      },

      removeItem: async (productId) => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) return;

        set({ items: get().items.filter(item => item.productId !== productId) });

        try {
          await cartService.removeFromCart(productId);
          await get().syncWithServer();
        } catch (err) {
          console.error(err);
        }
      },

      updateQuantity: (productId, quantity) => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) return;

        const prevItems = get().items;
        const newItems = prevItems.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        );

        set({ items: newItems });

        cartService.updateCartItem(productId, quantity)
          .then(() => get().syncWithServer())
          .catch(err => console.error(err));
      },

     clearCart: () => {
  const { isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated) {
    set({ items: [] });
  }
}
,


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

      getProductQuantity: (productId: string) => {
        return get().items.find(item => item.productId === productId)?.quantity || 0;
      },

      isProductInCart: (productId: string) => {
        return get().items.some(item => item.productId === productId);
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
