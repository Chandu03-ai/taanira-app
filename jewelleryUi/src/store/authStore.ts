import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { authService } from '../services';
import { RESPONSE_CODES } from '../constants/appConstants';
import { useCartStore } from './cartStore';
import { SendEmailResponse } from '../types/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  emailStatus: SendEmailResponse | null;

  login: (credentials: { username: string; password: string }) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  sendEmailConfirmation: (email: string) => Promise<void>;
  logout: () => void;
  verifyToken: () => Promise<boolean>;
  updateUser: (user: User) => void;
  initialize: () => Promise<void>;
}

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

          if (response && (response.code === RESPONSE_CODES.LOGIN_SUCCESS || response.success)) {
            const user: User = {
              id: response.result?.id || response.data?.id,
              email: response.result?.email || response.data?.email,
              firstname: response.result?.firstname || response.data?.firstname,
              lastname: response.result?.lastname || response.data?.lastname,
              contact: response.result?.contact || response.data?.contact,
              username: response.result?.username || response.data?.username,
              role: (response.result?.role || response.data?.role) as 'Admin' | 'User' | undefined,
            };

            set({
              user,
              isAuthenticated: true,
              loading: false
            });

            const cartStore = useCartStore.getState();
            await cartStore.syncWithServer();
            cartStore.resetCartStore();

            return true;
          }

          console.error('Login failed:', response);
          set({ loading: false });
          return false;
        } catch (error) {
          console.error('Login failed:', error);
          set({ loading: false });
          return false;
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
              firstname: response.result.firstname,
              lastname: response.result.lastname,
              contact: response.result.contact,
              username: response.result.username,
              role: response.result.role as 'Admin' | 'User' | undefined,
            };

            set({
              user,
              isAuthenticated: true,
              loading: false
            });

            const cartStore = useCartStore.getState();
            await cartStore.syncWithServer();
            cartStore.resetCartStore();

            return true;
          }

          set({ loading: false });
          return false;
        } catch (error) {
          console.error('Registration failed:', error);
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
        }
      },

      verifyToken: async () => {
        try {
          const response = await authService.verifyToken();

          if (response.code === RESPONSE_CODES.TOKEN_VERIFIED) {
            const user: User = {
              id: response.result.id,
              email: response.result.email,
              firstname: response.result.firstname,
              lastname: response.result.lastname,
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

          set({
            user: null,
            isAuthenticated: false
          });
          return false;
        } catch (error) {
          console.error('Token verification failed:', error);
          set({
            user: null,
            isAuthenticated: false
          });
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
