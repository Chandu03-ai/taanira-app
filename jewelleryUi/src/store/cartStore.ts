import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, GuestCartItem } from '../types';
import { useAuthStore } from './authStore';
import { cartService } from '../services/cartService';

interface CartState {
  items: CartItem[];
  guestItems: GuestCartItem[];
  totalItems: number; 
  totalPrice: number;

  // Actions
  addItem: (product: Product, quantity: number, selectedSize?: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>; 
  updateQuantity: (itemId: string, delta: number) => Promise<void>; 
  updateItemSize: (itemId: string, selectedSize: string) => Promise<void>;
  clearCart: (cartIdsToRemove?: string[]) => Promise<void>;
  getTotalPrice: () => number; 
  getItemCount: () => number; 
  getProductQuantity: (productId: string, selectedSize?: string) => number;
  isProductInCart: (productId: string, selectedSize?: string) => boolean;
  syncWithServer: () => Promise<void>; 
  resetCartStore: () => void;
  getUniqueItemCount: () => number;
  
  // Guest cart actions
  addGuestItem: (product: Product, quantity: number, selectedSize?: string) => void;
  removeGuestItem: (itemId: string) => void;
  updateGuestQuantity: (itemId: string, delta: number) => void;
  clearGuestCart: () => void;
  mergeGuestCartWithServer: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      guestItems: [],
      totalItems: 0,
      totalPrice: 0,

      // Universal add item - works for both guest and authenticated users
      addItem: async (product, quantity, selectedSize) => {
        const { isAuthenticated } = useAuthStore.getState();
        
        if (!isAuthenticated) {
          // Add to guest cart
          get().addGuestItem(product, quantity, selectedSize);
          return;
        }

        // Authenticated user flow (existing logic)
        const effectiveSize = selectedSize || undefined;
        const existingItem = get().items.find(
          item => item.productId === product.id && item.selectedSize === effectiveSize
        );

        if (existingItem) {
          await get().updateQuantity(existingItem.id, quantity);
        } else {
          try {
            const backendResponse = await cartService.addToCart(product.id, quantity, effectiveSize);
            const backendItem = backendResponse.result;

            if (!backendItem || !backendItem.id) {
              throw new Error("Backend did not return a valid cart item with an ID.");
            }

            const newItem: CartItem = {
              id: backendItem.id,
              productId: product.id,
              quantity: backendItem.quantity,
              selectedSize: effectiveSize,
              product,
            };

            set((state) => {
              const newItems = [...state.items, newItem];
              const updatedTotalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
              const updatedTotalPrice = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
              return { items: newItems, totalItems: updatedTotalItems, totalPrice: updatedTotalPrice };
            });
          } catch (err) {
            console.error('Failed to add to cart:', err);
          }
        }
        await get().syncWithServer();
      },

      // Guest cart management
      addGuestItem: (product, quantity, selectedSize) => {
        const effectiveSize = selectedSize || undefined;
        const existingItem = get().guestItems.find(
          item => item.productId === product.id && item.selectedSize === effectiveSize
        );

        if (existingItem) {
          get().updateGuestQuantity(existingItem.id, quantity);
        } else {
          const newGuestItem: GuestCartItem = {
            id: `guest-${Date.now()}-${Math.random()}`,
            productId: product.id,
            quantity,
            selectedSize: effectiveSize,
            product,
          };

          set((state) => {
            const newGuestItems = [...state.guestItems, newGuestItem];
            const updatedTotalItems = newGuestItems.reduce((sum, item) => sum + item.quantity, 0);
            const updatedTotalPrice = newGuestItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
            return { 
              guestItems: newGuestItems, 
              totalItems: updatedTotalItems, 
              totalPrice: updatedTotalPrice 
            };
          });
        }
      },

      removeGuestItem: (itemId) => {
        set((state) => {
          const newGuestItems = state.guestItems.filter(item => item.id !== itemId);
          const updatedTotalItems = newGuestItems.reduce((sum, item) => sum + item.quantity, 0);
          const updatedTotalPrice = newGuestItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
          return { 
            guestItems: newGuestItems, 
            totalItems: updatedTotalItems, 
            totalPrice: updatedTotalPrice 
          };
        });
      },

      updateGuestQuantity: (itemId, delta) => {
        const item = get().guestItems.find(item => item.id === itemId);
        if (!item) return;

        const newQuantity = item.quantity + delta;
        if (newQuantity <= 0) {
          get().removeGuestItem(itemId);
          return;
        }

        set((state) => {
          const newGuestItems = state.guestItems.map(item =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          );
          const updatedTotalItems = newGuestItems.reduce((sum, item) => sum + item.quantity, 0);
          const updatedTotalPrice = newGuestItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
          return { 
            guestItems: newGuestItems, 
            totalItems: updatedTotalItems, 
            totalPrice: updatedTotalPrice 
          };
        });
      },

      clearGuestCart: () => {
        set({ guestItems: [], totalItems: 0, totalPrice: 0 });
      },

      // Merge guest cart with server when user logs in
      mergeGuestCartWithServer: async () => {
        const { guestItems } = get();
        if (guestItems.length === 0) return;

        try {
          // Add each guest item to server cart
          for (const guestItem of guestItems) {
            await cartService.addToCart(
              guestItem.productId, 
              guestItem.quantity, 
              guestItem.selectedSize
            );
          }

          // Clear guest cart after successful merge
          get().clearGuestCart();
          
          // Sync with server to get updated cart
          await get().syncWithServer();
        } catch (error) {
          console.error('Failed to merge guest cart:', error);
        }
      },

      // Action to remove an item from the cart
      removeItem: async (itemId) => {
        const { isAuthenticated } = useAuthStore.getState();
        
        if (!isAuthenticated) {
          // Remove from guest cart
          get().removeGuestItem(itemId);
          return;
        }

        const itemToRemove = get().items.find(item => item.id === itemId);
        if (!itemToRemove) {
          console.warn(`Attempted to remove non-existent item with ID: ${itemId}`);
          return;
        }

        set((state) => {
          const newItems = state.items.filter(i => i.id !== itemId);
          const updatedTotalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const updatedTotalPrice = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
          return { items: newItems, totalItems: updatedTotalItems, totalPrice: updatedTotalPrice };
        });

        try {
          await cartService.removeFromCart(itemToRemove.id, itemToRemove.selectedSize);
        } catch (err) {
          console.error('Failed to remove cart item on server:', err);
          set((state) => {
            const revertedItems = [...state.items, itemToRemove];
            const updatedTotalItems = revertedItems.reduce((sum, item) => sum + item.quantity, 0);
            const updatedTotalPrice = revertedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
            return { items: revertedItems, totalItems: updatedTotalItems, totalPrice: updatedTotalPrice };
          });
        }
        await get().syncWithServer();
      },

      // Action to update the quantity of an existing item by a delta (+1 or -1)
      updateQuantity: async (itemId, delta) => {
        const { isAuthenticated } = useAuthStore.getState();
        
        if (!isAuthenticated) {
          // Update guest cart
          get().updateGuestQuantity(itemId, delta);
          return;
        }

        const itemToUpdate = get().items.find(item => item.id === itemId);
        if (!itemToUpdate) {
          console.warn(`Attempted to update quantity for non-existent item with ID: ${itemId}`);
          return;
        }

        const newQuantity = itemToUpdate.quantity + delta;

        if (newQuantity <= 0) {
          await get().removeItem(itemId);
          return;
        }

        set((state) => {
          const newItems = state.items.map((item) =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          );
          const updatedTotalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const updatedTotalPrice = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
          return { items: newItems, totalItems: updatedTotalItems, totalPrice: updatedTotalPrice };
        });

        try {
          await cartService.updateCartItem(itemToUpdate.id, delta);
        } catch (err) {
          console.error("Failed to update cart item quantity on server:", err);
          set((state) => {
            const revertedItems = state.items.map((item) =>
              item.id === itemId ? { ...item, quantity: itemToUpdate.quantity } : item
            );
            const updatedTotalItems = revertedItems.reduce((sum, item) => sum + item.quantity, 0);
            const updatedTotalPrice = revertedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
            return { items: revertedItems, totalItems: updatedTotalItems, totalPrice: updatedTotalPrice };
          });
        }
        await get().syncWithServer();
      },

      // Action to update the size of an existing item
      updateItemSize: async (itemId, selectedSize) => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
          console.warn("User not authenticated. Cannot update item size.");
          return;
        }

        const itemToUpdate = get().items.find(item => item.id === itemId);
        if (!itemToUpdate) {
          console.warn(`Attempted to update size for non-existent item with ID: ${itemId}`);
          return;
        }

        const originalSelectedSize = itemToUpdate.selectedSize;

        set((state) => {
          const newItems = state.items.map(i =>
            i.id === itemId ? { ...i, selectedSize } : i
          );
          const updatedTotalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const updatedTotalPrice = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
          return { items: newItems, totalItems: updatedTotalItems, totalPrice: updatedTotalPrice };
        });

        try {
          await cartService.updateCartItemSize(itemToUpdate.productId, selectedSize);
        } catch (err) {
          console.error('Failed to update item size on server:', err);
          set((state) => {
            const revertedItems = state.items.map(i => i.id === itemId ? { ...i, selectedSize: originalSelectedSize } : i);
            const updatedTotalItems = revertedItems.reduce((sum, item) => sum + item.quantity, 0);
            const updatedTotalPrice = revertedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
            return { items: revertedItems, totalItems: updatedTotalItems, totalPrice: updatedTotalPrice };
          });
        }
        await get().syncWithServer();
      },

      // Action to clear the entire cart
      clearCart: async (cartIdsToRemove) => {
        const { items, guestItems } = get();
        const { isAuthenticated } = useAuthStore.getState();

        if (!isAuthenticated) {
          // Clear guest cart
          get().clearGuestCart();
          return;
        }

        const filteredItems = cartIdsToRemove
          ? items.filter(item => !cartIdsToRemove.includes(item.id))
          : [];

        set({
          items: filteredItems,
          totalItems: filteredItems.reduce((sum, i) => sum + i.quantity, 0),
          totalPrice: filteredItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
        });

        if (cartIdsToRemove?.length) {
          try {
            await Promise.all(cartIdsToRemove.map(id => cartService.removeFromCart(id)));
          } catch (err) {
            console.error('Error removing items from backend:', err);
          }
        }
      },

      // Getter: Calculates total price of items in the cart
      getTotalPrice: () => {
        const { isAuthenticated } = useAuthStore.getState();
        const { items, guestItems } = get();
        
        const activeItems = isAuthenticated ? items : guestItems;
        
        // Calculate full total price (not considering payment type here)
        return activeItems.reduce((total, item) => {
          const product = item.product;
          return total + ((product?.price || 0) * item.quantity);
        }, 0);
      },

      // Getter: Calculates total count of all items (sum of quantities)
      getItemCount: () => {
        const { isAuthenticated } = useAuthStore.getState();
        const { items, guestItems } = get();
        
        const activeItems = isAuthenticated ? items : guestItems;
        return activeItems.reduce((count, item) => count + item.quantity, 0);
      },

      // Getter: Calculates number of unique items in the cart
      getUniqueItemCount: () => {
        const { isAuthenticated } = useAuthStore.getState();
        const { items, guestItems } = get();
        
        const activeItems = isAuthenticated ? items : guestItems;
        return activeItems.length;
      },

      // Getter: Gets the quantity of a specific product (with optional size) in the cart
      getProductQuantity: (productId: string, selectedSize?: string) => {
        const { isAuthenticated } = useAuthStore.getState();
        const { items, guestItems } = get();
        
        const effectiveSize = selectedSize || undefined;
        const activeItems = isAuthenticated ? items : guestItems;
        
        return activeItems.find(item =>
          item.productId === productId && item.selectedSize === effectiveSize
        )?.quantity || 0;
      },

      // Getter: Checks if a specific product (with optional size) is in the cart
      isProductInCart: (productId: string, selectedSize?: string) => {
        const { isAuthenticated } = useAuthStore.getState();
        const { items, guestItems } = get();
        
        const effectiveSize = selectedSize || undefined;
        const activeItems = isAuthenticated ? items : guestItems;
        
        return activeItems.some(item =>
          item.productId === productId && item.selectedSize === effectiveSize
        );
      },

      // Action to reset the cart store to its initial empty state
      resetCartStore: () => {
        set({ items: [], guestItems: [], totalItems: 0, totalPrice: 0 });
      },

      // Action to synchronize the local cart state with the backend cart
      syncWithServer: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
          // For guest users, calculate totals from guest items
          const { guestItems } = get();
          const updatedTotalItems = guestItems.reduce((sum, item) => sum + item.quantity, 0);
          const updatedTotalPrice = guestItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
          set({ totalItems: updatedTotalItems, totalPrice: updatedTotalPrice });
          return;
        }

        try {
          const response = await cartService.getCart();
          if (response.result) {
            const fetchedItems: CartItem[] = response.result.map(backendItem => ({
              id: backendItem.id,
              productId: backendItem.productId,
              quantity: backendItem.quantity,
              selectedSize: backendItem.selectedSize || undefined,
              product: backendItem.product,
            }));

            const updatedTotalItems = fetchedItems.reduce((sum, item) => sum + item.quantity, 0);
            const updatedTotalPrice = fetchedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

            set({ items: fetchedItems, totalItems: updatedTotalItems, totalPrice: updatedTotalPrice });
          } else {
            set({ items: [], totalItems: 0, totalPrice: 0 });
          }
        } catch (err) {
          console.error('Failed to sync cart:', err);
        }
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ 
        items: state.items, 
        guestItems: state.guestItems 
      }),
    }
  )
);