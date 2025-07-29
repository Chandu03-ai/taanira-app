import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types'; // Ensure your Product type is correctly imported and defined
// Assuming useAuthStore and cartService are correctly imported and functional
import { useAuthStore } from './authStore';
import { cartService } from '../services/cartService';

// Define the structure of a single item within the cart
export interface CartItem {
  id: string; // Unique ID for the cart item, typically from the backend
  productId: string;
  quantity: number;
  selectedSize?: string; // Optional: for products that don't have size variations
  product: Product; // Storing the full product data for easy access
}

// Define the shape of your cart store's state and actions
interface CartState {
  items: CartItem[];
  totalItems: number; // Total count of all items (sum of quantities)
  totalPrice: number; // Total price of all items in the cart

  // Actions
  addItem: (product: Product, quantity: number, selectedSize?: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>; // Uses CartItem.id
  updateQuantity: (itemId: string, delta: number) => Promise<void>; // Uses CartItem.id, sends delta to backend
  updateItemSize: (itemId: string, selectedSize: string) => Promise<void>; // Uses CartItem.id
  clearCart: () => void;
  getTotalPrice: () => number; // Getter, not a state field
  getItemCount: () => number; // Getter, not a state field
  getProductQuantity: (productId: string, selectedSize?: string) => number;
  isProductInCart: (productId: string, selectedSize?: string) => boolean;
  syncWithServer: () => Promise<void>; // To fetch the latest cart from the backend
  resetCartStore: () => void;
  getUniqueItemCount: () => number; // Getter, number of unique items
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,

      // Action to add an item to the cart
      addItem: async (product, quantity, selectedSize) => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
          console.warn("User not authenticated. Cannot add item to cart.");
          return;
        }

        // Normalize selectedSize to undefined if it's an empty string or null for consistent lookup
        const effectiveSize = selectedSize || undefined;

        const existingItem = get().items.find(
          item => item.productId === product.id && item.selectedSize === effectiveSize
        );

        if (existingItem) {
          // If item already exists, update its quantity by the given 'quantity' (delta)
          await get().updateQuantity(existingItem.id, quantity);
        } else {
          try {
            // Call backend service to add new item
            const backendResponse = await cartService.addToCart(product.id, quantity, effectiveSize);
            const backendItem = backendResponse.result; // Assuming backendResponse.result is the CartItem

            if (!backendItem || !backendItem.id) {
              throw new Error("Backend did not return a valid cart item with an ID.");
            }

            const newItem: CartItem = {
              id: backendItem.id, // Use the ID provided by the backend
              productId: product.id,
              quantity: backendItem.quantity, // Use quantity from backend response
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
            // Handle error, e.g., show a notification to the user
          }
        }
        // Sync with server after any cart modification to ensure UI reflects backend state
        await get().syncWithServer();
      },

      // Action to remove an item from the cart
      removeItem: async (itemId) => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
          console.warn("User not authenticated. Cannot remove item from cart.");
          return;
        }

        const itemToRemove = get().items.find(item => item.id === itemId);
        if (!itemToRemove) {
          console.warn(`Attempted to remove non-existent item with ID: ${itemId}`);
          return;
        }

        // Optimistic UI update: Remove the item immediately
        set((state) => {
          const newItems = state.items.filter(i => i.id !== itemId);
          const updatedTotalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const updatedTotalPrice = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
          return { items: newItems, totalItems: updatedTotalItems, totalPrice: updatedTotalPrice };
        });

        try {
          // Call backend service to remove item
          await cartService.removeFromCart(itemToRemove.id, itemToRemove.selectedSize);
        } catch (err) {
          console.error('Failed to remove cart item on server:', err);
          // Revert UI state if backend call fails (e.g., add item back)
          set((state) => {
            const revertedItems = [...state.items, itemToRemove];
            const updatedTotalItems = revertedItems.reduce((sum, item) => sum + item.quantity, 0);
            const updatedTotalPrice = revertedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
            return { items: revertedItems, totalItems: updatedTotalItems, totalPrice: updatedTotalPrice };
          });
        }
        // Sync with server after any cart modification to ensure UI reflects backend state
        await get().syncWithServer();
      },

      // Action to update the quantity of an existing item by a delta (+1 or -1)
      updateQuantity: async (itemId, delta) => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
          console.warn("User not authenticated. Cannot update item quantity.");
          return;
        }

        const itemToUpdate = get().items.find(item => item.id === itemId);
        if (!itemToUpdate) {
          console.warn(`Attempted to update quantity for non-existent item with ID: ${itemId}`);
          return;
        }

        const newQuantity = itemToUpdate.quantity + delta;

        if (newQuantity <= 0) {
          // If quantity drops to 0 or less, remove the item
          await get().removeItem(itemId);
          return;
        }

        // Optimistic UI update: Update the state immediately
        set((state) => {
          const newItems = state.items.map((item) =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          );
          const updatedTotalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const updatedTotalPrice = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
          return { items: newItems, totalItems: updatedTotalItems, totalPrice: updatedTotalPrice };
        });

        try {
          // Send only the delta to the backend (assuming backend handles the new total quantity)
          await cartService.updateCartItem(itemToUpdate.id, delta);
        } catch (err) {
          console.error("Failed to update cart item quantity on server:", err);
          // Revert UI state if the backend call fails
          set((state) => {
            const revertedItems = state.items.map((item) =>
              item.id === itemId ? { ...item, quantity: itemToUpdate.quantity } : item
            );
            const updatedTotalItems = revertedItems.reduce((sum, item) => sum + item.quantity, 0);
            const updatedTotalPrice = revertedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
            return { items: revertedItems, totalItems: updatedTotalItems, totalPrice: updatedTotalPrice };
          });
        }
        // Sync with server after any cart modification to ensure UI reflects backend state
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

        // Optimistic UI update
        set((state) => {
          const newItems = state.items.map(i =>
            i.id === itemId ? { ...i, selectedSize } : i
          );
          const updatedTotalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const updatedTotalPrice = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
          return { items: newItems, totalItems: updatedTotalItems, totalPrice: updatedTotalPrice };
        });

        try {
          // Assuming cartService.updateCartItemSize takes productId and new size
          await cartService.updateCartItemSize(itemToUpdate.productId, selectedSize);
        } catch (err) {
          console.error('Failed to update item size on server:', err);
          // Revert if error
          set((state) => {
            const revertedItems = state.items.map(i => i.id === itemId ? { ...i, selectedSize: originalSelectedSize } : i);
            const updatedTotalItems = revertedItems.reduce((sum, item) => sum + item.quantity, 0);
            const updatedTotalPrice = revertedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
            return { items: revertedItems, totalItems: updatedTotalItems, totalPrice: updatedTotalPrice };
          });
        }
        // Sync with server after any cart modification to ensure UI reflects backend state
        await get().syncWithServer();
      },

      // Action to clear the entire cart
      clearCart: () => {
        set({ items: [], totalItems: 0, totalPrice: 0 });
      },

      // Getter: Calculates total price of items in the cart
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + (item.product?.price || 0) * item.quantity,
          0
        );
      },

      // Getter: Calculates total count of all items (sum of quantities)
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      // Getter: Calculates number of unique items in the cart
      getUniqueItemCount: () => {
        return get().items.length;
      },

      // Getter: Gets the quantity of a specific product (with optional size) in the cart
      getProductQuantity: (productId: string, selectedSize?: string) => {
        const effectiveSize = selectedSize || undefined; // Normalize for consistent lookup
        return get().items.find(item =>
          item.productId === productId && item.selectedSize === effectiveSize
        )?.quantity || 0;
      },

      // Getter: Checks if a specific product (with optional size) is in the cart
      isProductInCart: (productId: string, selectedSize?: string) => {
        const effectiveSize = selectedSize || undefined; // Normalize for consistent lookup
        return get().items.some(item =>
          item.productId === productId && item.selectedSize === effectiveSize
        );
      },

      // Action to reset the cart store to its initial empty state
      resetCartStore: () => {
        set({ items: [], totalItems: 0, totalPrice: 0 });
      },

      // Action to synchronize the local cart state with the backend cart
      syncWithServer: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
          // If not authenticated, clear local cart (or handle as guest cart)
          set({ items: [], totalItems: 0, totalPrice: 0 });
          return;
        }

        try {
          const response = await cartService.getCart();
          if (response.result) {
            // Ensure backend response items match CartItem structure
            const fetchedItems: CartItem[] = response.result.map(backendItem => ({
              id: backendItem.id,
              productId: backendItem.productId,
              quantity: backendItem.quantity,
              selectedSize: backendItem.selectedSize || undefined,
              product: backendItem.product, // Assuming backend provides full product data
            }));

            const updatedTotalItems = fetchedItems.reduce((sum, item) => sum + item.quantity, 0);
            const updatedTotalPrice = fetchedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

            set({ items: fetchedItems, totalItems: updatedTotalItems, totalPrice: updatedTotalPrice });
          } else {
            set({ items: [], totalItems: 0, totalPrice: 0 }); // Clear if no result
          }
        } catch (err) {
          console.error('Failed to sync cart:', err);
          // Optionally, show an error message to the user
        }
      },
    }),
    {
      name: 'cart-storage', // Name for localStorage key
      // Only persist 'items' to local storage. 'totalItems' and 'totalPrice' are derived.
      partialize: (state) => ({ items: state.items }),
      // You might need to add a custom deserialize function if 'Product' objects
      // contain non-serializable data or if you want to re-fetch product details
      // on hydration to ensure they are up-to-date. For now, assuming direct JSON.parse works.
    }
  )
);