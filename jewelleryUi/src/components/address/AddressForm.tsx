import React, { useState, useEffect } from 'react';
import { Home, Building, MapPin, X, Loader } from 'lucide-react';
import { AddressFormData, Address } from '../../types/address';
import { pincodeService } from '../../services/pincodeService';
import Dialog from '../common/Dialog';

interface AddressFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (addressData: AddressFormData) => void;
  address?: Address | null;
  loading?: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({
  isOpen,
  onClose,
  onSave,
  address,
  loading = false
}) => {
  const [formData, setFormData] = useState<AddressFormData>({
    fullName: '',
    mobileNumber: '',
    pincode: '',
    houseNumber: '',
    streetArea: '',
    landmark: '',
    city: '',
    state: '',
    addressType: 'home',
    isDefault: false,
  });

  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<AddressFormData>>({});
  const [submitError, setSubmitError] = useState<string>('');

  useEffect(() => {
    if (address) {
      setFormData({
        fullName: address.fullName,
        mobileNumber: address.mobileNumber,
        pincode: address.pincode,
        houseNumber: address.houseNumber,
        streetArea: address.streetArea,
        landmark: address.landmark || '',
        city: address.city,
        state: address.state,
        addressType: address.addressType,
        isDefault: address.isDefault,
      });
    } else {
      setFormData({
        fullName: '',
        mobileNumber: '',
        pincode: '',
        houseNumber: '',
        streetArea: '',
        landmark: '',
        city: '',
        state: '',
        addressType: 'home',
        isDefault: false,
      });
    }
    setErrors({});
  }, [address, isOpen]);

  // Clear submit error when form data changes
  useEffect(() => {
    if (submitError) {
      setSubmitError('');
    }
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof AddressFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const pincode = e.target.value;
    setFormData(prev => ({ ...prev, pincode }));

    if (pincodeService.validatePincode(pincode)) {
      setPincodeLoading(true);
      try {
        const pincodeData = await pincodeService.getPincodeData(pincode);
        if (pincodeData) {
          setFormData(prev => ({
            ...prev,
            city: pincodeData.city,
            state: pincodeData.state
          }));
        }
      } catch (error) {
        console.error('Error fetching pincode data:', error);
      } finally {
        setPincodeLoading(false);
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<AddressFormData> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!pincodeService.validateMobileNumber(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }

    if (!pincodeService.validatePincode(formData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }

    if (!formData.houseNumber.trim()) {
      newErrors.houseNumber = 'House number is required';
    }

    if (!formData.streetArea.trim()) {
      newErrors.streetArea = 'Street/Area is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitError('');

  if (validateForm()) {
    try {
      onSave(formData);   // Trigger save (can be async if needed)
      onClose();          // Close the form after save
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save address');
    }
  }
};


  const addressTypeOptions = [
    { value: 'home', label: 'Home', icon: Home },
    { value: 'office', label: 'Office', icon: Building },
    { value: 'other', label: 'Other', icon: MapPin },
  ];

  return (
  <Dialog
    isOpen={isOpen}
    onClose={onClose}
    title={
      address
        ? 'Edit Address'
        : '💎 Add Your Delivery Address'
    }
    maxWidth="lg"
  >
    <div className="mb-6 text-sm text-rich-brown font-serif font-light italic leading-relaxed">
      We deliver your precious jewelry with care. Please provide your delivery address to ensure timely and secure shipping.
    </div>

    {/* Submit Error */}
    {submitError && (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-serif italic">
        {submitError}
      </div>
    )}

      <form onSubmit={handleSubmit} className="grid gap-6">
        {/* Full Name & Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-serif font-semibold italic text-rich-brown mb-2">Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="e.g., Priya Sharma"
              className={`input-elegant ${errors.fullName ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''
                }`}
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-2 font-serif italic">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-sm font-serif font-semibold italic text-rich-brown mb-2">Mobile Number *</label>
            <input
              type="tel"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleInputChange}
              placeholder="10-digit Indian mobile number"
              maxLength={10}
              className={`input-elegant ${errors.mobileNumber ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''
                }`}
            />
            {errors.mobileNumber && <p className="text-red-500 text-xs mt-2 font-serif italic">{errors.mobileNumber}</p>}
          </div>
        </div>

        {/* Pincode, City, State */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#4A3F36] font-serif mb-1">Pincode *</label>
            <div className="relative">
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handlePincodeChange}
                placeholder="6-digit pincode"
                maxLength={6}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#DEC9A3] font-serif italic text-[#4A3F36] ${errors.pincode ? 'border-red-500' : 'border-[#d6cdbf]'
                  }`}
              />
              {pincodeLoading && (
                <Loader className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-[#AA732F]" />
              )}
            </div>
            {errors.pincode && <p className="text-red-500 text-xs mt-1 font-serif">{errors.pincode}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4A3F36] font-serif mb-1">City *</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="City"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#DEC9A3] font-serif italic text-[#4A3F36] ${errors.city ? 'border-red-500' : 'border-[#d6cdbf]'
                }`}
            />
            {errors.city && <p className="text-red-500 text-xs mt-1 font-serif">{errors.city}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4A3F36] font-serif mb-1">State *</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              placeholder="State"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#DEC9A3] font-serif italic text-[#4A3F36] ${errors.state ? 'border-red-500' : 'border-[#d6cdbf]'
                }`}
            />
            {errors.state && <p className="text-red-500 text-xs mt-1 font-serif">{errors.state}</p>}
          </div>
        </div>

        {/* House No + Street */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#4A3F36] font-serif mb-1">House No. / Building Name *</label>
            <input
              type="text"
              name="houseNumber"
              value={formData.houseNumber}
              onChange={handleInputChange}
              placeholder="e.g., Flat 502, Pearl Residency"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#DEC9A3] font-serif italic text-[#4A3F36] ${errors.houseNumber ? 'border-red-500' : 'border-[#d6cdbf]'
                }`}
            />
            {errors.houseNumber && <p className="text-red-500 text-xs mt-1 font-serif">{errors.houseNumber}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4A3F36] font-serif mb-1">Street / Area / Locality *</label>
            <input
              type="text"
              name="streetArea"
              value={formData.streetArea}
              onChange={handleInputChange}
              placeholder="e.g., Lajpat Nagar, Near City Mall"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#DEC9A3] font-serif italic text-[#4A3F36] ${errors.streetArea ? 'border-red-500' : 'border-[#d6cdbf]'
                }`}
            />
            {errors.streetArea && <p className="text-red-500 text-xs mt-1 font-serif">{errors.streetArea}</p>}
          </div>
        </div>

        {/* Landmark */}
        <div>
          <label className="block text-sm font-medium text-[#4A3F36] font-serif mb-1">Landmark (Optional)</label>
          <input
            type="text"
            name="landmark"
            value={formData.landmark}
            onChange={handleInputChange}
            placeholder="e.g., Opposite SBI ATM"
            className="w-full px-3 py-2 border border-[#d6cdbf] rounded-lg focus:ring-2 focus:ring-[#DEC9A3] font-serif italic text-[#4A3F36]"
          />
        </div>

        {/* Address Type */}
        <div>
          <label className="block text-sm font-medium text-[#4A3F36] font-serif mb-3">Address Type</label>
          <div className="flex flex-wrap gap-3">
            {addressTypeOptions.map(({ value, label }) => (
              <label key={value} className="cursor-pointer">
                <input
                  type="radio"
                  name="addressType"
                  value={value}
                  checked={formData.addressType === value}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div
                  className={`px-4 py-2 rounded-lg border text-sm font-serif italic ${formData.addressType === value
                      ? 'border-[#AA732F] bg-[#fdf8f1] text-[#4A3F36]'
                      : 'border-[#d6cdbf] hover:border-[#DEC9A3] text-[#4A3F36]'
                    }`}
                >
                  {label}
                </div>
              </label>
            ))}

          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t border-[#e9e2d1]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2 text-sm bg-[#f0ece2] text-[#4A3F36] rounded-lg hover:bg-[#e3dcc9] font-serif italic"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-[#AA732F] text-white text-sm rounded-lg hover:bg-[#8f5c20] flex items-center justify-center space-x-2 font-serif italic"
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Address</span>
            )}
          </button>
        </div>
      </form>
    </Dialog>
  );

};

export default AddressForm;