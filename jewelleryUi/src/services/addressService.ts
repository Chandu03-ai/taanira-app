import BaseService from './baseService';
import { Address, AddressFormData } from '../types/address';
import { ApiResponse } from '../types/api';

class AddressService extends BaseService {
    // Get all addresses for the authenticated user
    async getUserAddresses(): Promise<ApiResponse<Address[]>> {
        return this.get<Address[]>('/user/addresses', true);
    }

    // Create a new address
    async createAddress(addressData: AddressFormData): Promise<ApiResponse<Address>> {
        return this.post<Address>('/user/addresses', addressData, true);
    }

    // Update an existing address
    async updateAddress(addressId: string, addressData: Partial<AddressFormData>): Promise<ApiResponse<Address>> {
        return this.put<Address>(`/user/addresses/${addressId}`, addressData, true);
    }

    // Delete an address
    async deleteAddress(addressId: string): Promise<ApiResponse<void>> {
        return this.delete<void>(`/user/addresses/${addressId}`, true);
    }

    // Set an address as default
    async setDefaultAddress(addressId: string): Promise<ApiResponse<void>> {
        return this.put<void>(`/user/addresses/${addressId}/default`, {}, true);
    }

    // Get a specific address by ID
    async getAddress(userId: string): Promise<ApiResponse<Address | Address[]>> {
        return this.get<Address | Address[]>(`/user/addresses/${userId}`, true);
    }


    // Validate pincode and get location data
    async validatePincode(pincode: string): Promise<ApiResponse<{
        pincode: string;
        city: string;
        state: string;
        district: string;
        isValid: boolean;
    }>> {
        return this.get<{
            pincode: string;
            city: string;
            state: string;
            district: string;
            isValid: boolean;
        }>(`/utils/pincode/${pincode}`);
    }
}

export const addressService = new AddressService();