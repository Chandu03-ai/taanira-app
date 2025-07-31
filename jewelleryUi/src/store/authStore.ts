import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { authService } from '../services';
import { RESPONSE_CODES } from '../constants/appConstants';
import { useCartStore } from './cartStore';
import { AuthState } from '../types/api';



export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      emailStatus: null,

      login: async (credentials) => {
        set({ loading: true });
        try {
          const response = await authService.login(credentials);

          if (response && response.code === RESPONSE_CODES.LOGIN_SUCCESS) {
            const user: User = {
              id: response.result?.id,
              email: response.result?.email,
              contact: response.result?.contact,
              username: response.result?.username,
              role: response.result?.role as 'Admin' | 'User' | undefined,
            };

            set({
              user,
              isAuthenticated: true,
              loading: false
            });

            const cartStore = useCartStore.getState();
            // Merge guest cart when user logs in
            await cartStore.mergeGuestCartWithServer();
            await cartStore.syncWithServer();

            return { success: true };
          }

          set({ loading: false });

          if (response.code === RESPONSE_CODES.INVALID_CREDENTIALS) {
            return { success: false, reason: 'INVALID_CREDENTIALS' };
          }

          console.error('Login failed:', response);
          return { success: false };
        } catch (error) {
          console.error('Login error:', error);
          set({ loading: false });
          return { success: false };
        }
      },

      register: async (userData) => {
        set({ loading: true });
        try {
          const response = await authService.register(userData);

          if (response.code === RESPONSE_CODES.REGISTER_SUCCESS) {
            const user: User = {
              id: response.result.id,
              email: response.result.email,
              contact: response.result.contact,
              username: response.result.email,
              role: response.result.role as 'Admin' | 'User' | undefined,
            };

            set({
              user,
              loading: false
            });

            const cartStore = useCartStore.getState();
            // Merge guest cart when user registers
            await cartStore.mergeGuestCartWithServer();
            await cartStore.syncWithServer();

            return true;
          }

          set({ loading: false });
          return false;
        } catch (error) {
          console.error('Registration error:', error);
          set({ loading: false });
          return false;
        }
      },

      sendEmailConfirmation: async (email) => {
        try {
          const response = await authService.sendRegistrationEmail(email);
          set({ emailStatus: response });
          console.log('✅ Email status saved to store:', response);
        } catch (error) {
          console.error('❌ Failed to send email:', error);
          set({ emailStatus: null });
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout API call failed:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false
          });

          // Clear cart
          const cartStore = useCartStore.getState();
          cartStore.resetCartStore();
        }
      },


      verifyToken: async () => {
        try {
          const response = await authService.verifyToken();

          if (response.code === RESPONSE_CODES.TOKEN_VERIFIED) {
            const user: User = {
              id: response.result.id,
              email: response.result.email,
              contact: response.result.contact,
              username: response.result.username,
              role: response.result.role as 'Admin' | 'User' | undefined,
            };

            set({
              user,
              isAuthenticated: true
            });
            return true;
          }

          // Token invalid
          set({
            user: null,
            isAuthenticated: false
          });

          const cartStore = useCartStore.getState();
          cartStore.resetCartStore();

          return false;
        } catch (error) {
          console.error('Token verification failed:', error);

          set({
            user: null,
            isAuthenticated: false
          });

          const cartStore = useCartStore.getState();
          cartStore.resetCartStore();

          return false;
        }
      },


      initialize: async () => {
        const state = get();
        if (state.user && state.isAuthenticated) {
          const isValid = await get().verifyToken();
          if (!isValid) {
            get().logout();
          }
        }
      },

      updateUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
    }
  )
);