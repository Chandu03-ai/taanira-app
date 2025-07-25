import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Address, AddressFormData } from '../types/address';
import { useAuthStore } from './authStore';
import { addressService } from '../services/addressService';

interface AddressState {
  addresses: Address[];
  selectedAddress: Address | null;
  loading: boolean;
  addAddress: (addressData: AddressFormData) => Promise<void>;
  updateAddress: (id: string, addressData: Partial<AddressFormData>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setSelectedAddress: (address: Address | null) => void;
  setDefaultAddress: (id: string) => Promise<void>;
  loadAddresses: () => Promise<void>;
  clearAddresses: () => void;
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      addresses: [],
      selectedAddress: null,
      loading: false,

      addAddress: async (addressData: AddressFormData) => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        set({ loading: true });
        try {
          const response = await addressService.createAddress(addressData);
          
          if (response.code === 2135 && response.result) {
            // Reload all addresses to get updated default status
            await get().loadAddresses();
          } else {
            throw new Error(response.message || 'Failed to create address');
          }
        } catch (error) {
          console.error('Error adding address:', error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      updateAddress: async (id: string, addressData: Partial<AddressFormData>) => {
        set({ loading: true });
        try {
          const response = await addressService.updateAddress(id, addressData);
          
          if (response.code === 2137 && response.result) {
            // Reload all addresses to get updated data
            await get().loadAddresses();
          } else {
            throw new Error(response.message || 'Failed to update address');
          }
        } catch (error) {
          console.error('Error updating address:', error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      deleteAddress: async (id: string) => {
        set({ loading: true });
        try {
          const response = await addressService.deleteAddress(id);
          
          if (response.code === 2139) {
            const selectedAddress = get().selectedAddress;
            
            // Clear selected address if it was deleted
            if (selectedAddress?.id === id) {
              set({ selectedAddress: null });
            }
            
            // Reload addresses
            await get().loadAddresses();
          } else {
            throw new Error(response.message || 'Failed to delete address');
          }
        } catch (error) {
          console.error('Error deleting address:', error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      setSelectedAddress: (address: Address | null) => {
        set({ selectedAddress: address });
      },

      setDefaultAddress: async (id: string) => {
        set({ loading: true });
        try {
          const response = await addressService.setDefaultAddress(id);
          
          if (response.code === 2141) {
            // Reload addresses to get updated default status
            await get().loadAddresses();
          } else {
            throw new Error(response.message || 'Failed to set default address');
          }
        } catch (error) {
          console.error('Error setting default address:', error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      loadAddresses: async () => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        set({ loading: true });
        try {
          const response = await addressService.getUserAddresses();
          console.log(response)
          
          if (response.code === 2143 && response.result) {
            set({ 
              addresses: response.result,
              loading: false 
            });
          } else {
            console.error('Failed to load addresses:', response.message);
            set({ 
              addresses: [],
              loading: false 
            });
          }
        } catch (error) {
          console.error('Error loading addresses:', error);
          set({ 
            addresses: [],
            loading: false 
          });
        }
      },

      clearAddresses: () => {
        set({ addresses: [], selectedAddress: null });
      },
    }),
    {
      name: 'address-storage',
    }
  )
);