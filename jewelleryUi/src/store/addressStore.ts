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
  loadAddresses: () => Promise<Address[]>;

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
        if (!user) {
          console.warn("No user logged in, cannot add address.");
          return;
        }

        set({ loading: true });
        try {
          const response = await addressService.createAddress(addressData);

          if (response.code === 2135 && response.result) {
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
            const currentSelectedAddress = get().selectedAddress;

            if (currentSelectedAddress?.id === id) {
              set({ selectedAddress: null });
            }

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
        if (!user) {
          set({ addresses: [], selectedAddress: null, loading: false });
          return [];
        }

        set({ loading: true });
        try {
          const response = await addressService.getUserAddresses();
          console.log("Loaded Addresses Response:", response);

          if (response.code === 2143 && response.result) {
            const loadedAddresses: Address[] = response.result;

            let defaultAddressFound = loadedAddresses.some((addr: Address) => addr.isDefault);
            let newSelectedAddress: Address | null = null;

            if (!defaultAddressFound && loadedAddresses.length > 0) {
              console.warn("No default address found from backend. Setting the first address as default locally.");
              loadedAddresses[0].isDefault = true;
            }

            const currentSelectedAddressId = get().selectedAddress?.id;
            if (currentSelectedAddressId) {
              newSelectedAddress = loadedAddresses.find(addr => addr.id === currentSelectedAddressId) || null;
            }

            if (!newSelectedAddress) {
              newSelectedAddress = loadedAddresses.find(addr => addr.isDefault) || loadedAddresses[0] || null;
            }

            set({
              addresses: loadedAddresses,
              selectedAddress: newSelectedAddress,
              loading: false
            });

            return loadedAddresses;
          } else {
            console.error('Failed to load addresses:', response.message || 'Unknown error');
            set({
              addresses: [],
              selectedAddress: null,
              loading: false
            });
            return [];
          }
        } catch (error) {
          console.error('Error loading addresses:', error);
          set({
            addresses: [],
            selectedAddress: null,
            loading: false
          });
          return [];
        }
      }
      ,

      clearAddresses: () => {
        set({ addresses: [], selectedAddress: null });
      },
    }),
    {
      name: 'address-storage',
    }
  )
);