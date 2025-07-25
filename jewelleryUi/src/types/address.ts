export interface Address {
  id: string;
  userId: string;
  fullName: string;
  mobileNumber: string;
  pincode: string;
  houseNumber: string;
  streetArea: string;
  landmark?: string;
  city: string;
  state: string;
  addressType: 'home' | 'office' | 'other';
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddressFormData {
  fullName: string;
  mobileNumber: string;
  pincode: string;
  houseNumber: string;
  streetArea: string;
  landmark: string;
  city: string;
  state: string;
  addressType: 'home' | 'office' | 'other';
  isDefault: boolean;
}

export interface PincodeData {
  block : string,
  pincode: string;
  city: string;
  state: string;
  district: string;
}