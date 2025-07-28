import React, { useState, useEffect } from 'react';
import { Home, Building, MapPin, Loader } from 'lucide-react';
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
        isDefault: false,
        addressType: 'home', // Ensure default is set for new address
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
          setErrors(prev => ({ ...prev, pincode: undefined, city: undefined, state: undefined })); // Clear errors on success
        } else {
          setErrors(prev => ({ ...prev, pincode: 'Pincode not found or invalid' }));
        }
      } catch (error) {
        console.error('Error fetching pincode data:', error);
        setErrors(prev => ({ ...prev, pincode: 'Failed to fetch pincode data' }));
      } finally {
        setPincodeLoading(false);
      }
    } else {
      setErrors(prev => ({ ...prev, pincode: 'Please enter a valid 6-digit pincode' }));
      setFormData(prev => ({ ...prev, city: '', state: '' }));
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
      newErrors.houseNumber = 'House number/Building name is required';
    }

    if (!formData.streetArea.trim()) {
      newErrors.streetArea = 'Street/Area/Locality is required';
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
        // onClose();           // We will close it *after* the onSave promise resolves in parent if it's async
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

  // Common input classes for consistency and responsiveness
  const inputClasses = `
    w-full px-3 py-2 sm:px-4 sm:py-2.5 border rounded-lg sm:rounded-xl
    focus:ring-2 focus:ring-[#DEC9A3] focus:border-[#AA732F]
    font-serif italic text-rich-brown placeholder:text-gray-400
    transition-all duration-200 ease-in-out
    min-w-0 /* Added to ensure inputs can shrink */
  `;

  const errorClasses = `
    border-red-500 focus:border-red-500 focus:ring-red-200
  `;

  const labelClasses = `
    block text-sm sm:text-base font-serif font-semibold italic text-rich-brown mb-2
  `;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        address
          ? 'Edit Address'
          : '💎 Add Your Delivery Address'
      }
      maxWidth="lg" // Dialog max width
    >
      <div className="mb-4 sm:mb-6 text-sm text-rich-brown font-serif font-light italic leading-relaxed">
        We deliver your precious jewelry with care. Please provide your delivery address to ensure timely and secure shipping.
      </div>

      {/* Submit Error */}
      {submitError && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl text-red-700 text-sm font-serif italic" role="alert">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4 sm:gap-6">
        {/* Full Name & Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fullName" className={labelClasses}>Full Name *</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter Your Full Name"
              className={`${inputClasses} ${errors.fullName ? errorClasses : 'border-[#d6cdbf]'}`}
              aria-invalid={errors.fullName ? "true" : "false"}
              aria-describedby={errors.fullName ? "fullName-error" : undefined}
            />
            {errors.fullName && <p id="fullName-error" className="text-red-500 text-xs mt-1 font-serif italic">{errors.fullName}</p>}
          </div>

          <div>
            <label htmlFor="mobileNumber" className={labelClasses}>Mobile Number *</label>
            <input
              type="tel"
              id="mobileNumber"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleInputChange}
              placeholder="10-digit Indian mobile number"
              maxLength={10}
              className={`${inputClasses} ${errors.mobileNumber ? errorClasses : 'border-[#d6cdbf]'}`}
              aria-invalid={errors.mobileNumber ? "true" : "false"}
              aria-describedby={errors.mobileNumber ? "mobileNumber-error" : undefined}
            />
            {errors.mobileNumber && <p id="mobileNumber-error" className="text-red-500 text-xs mt-1 font-serif italic">{errors.mobileNumber}</p>}
          </div>
        </div>

        {/* Pincode, City, State */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="pincode" className={labelClasses}>Pincode *</label>
            <div className="relative">
              <input
                type="text"
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handlePincodeChange}
                placeholder="6-digit pincode"
                maxLength={6}
                className={`${inputClasses} pr-10 ${errors.pincode ? errorClasses : 'border-[#d6cdbf]'}`}
                aria-invalid={errors.pincode ? "true" : "false"}
                aria-describedby={errors.pincode ? "pincode-error" : undefined}
              />
              {pincodeLoading && (
                <Loader className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 animate-spin text-[#AA732F]" />
              )}
            </div>
            {errors.pincode && <p id="pincode-error" className="text-red-500 text-xs mt-1 font-serif italic">{errors.pincode}</p>}
          </div>

          <div>
            <label htmlFor="city" className={labelClasses}>City *</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="City"
              className={`${inputClasses} ${errors.city ? errorClasses : 'border-[#d6cdbf]'}`}
              aria-invalid={errors.city ? "true" : "false"}
              aria-describedby={errors.city ? "city-error" : undefined}
            />
            {errors.city && <p id="city-error" className="text-red-500 text-xs mt-1 font-serif italic">{errors.city}</p>}
          </div>

          <div>
            <label htmlFor="state" className={labelClasses}>State *</label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              placeholder="State"
              className={`${inputClasses} ${errors.state ? errorClasses : 'border-[#d6cdbf]'}`}
              aria-invalid={errors.state ? "true" : "false"}
              aria-describedby={errors.state ? "state-error" : undefined}
            />
            {errors.state && <p id="state-error" className="text-red-500 text-xs mt-1 font-serif italic">{errors.state}</p>}
          </div>
        </div>

        {/* House No + Street */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="houseNumber" className={labelClasses}>House No. / Building Name *</label>
            <input
              type="text"
              id="houseNumber"
              name="houseNumber"
              value={formData.houseNumber}
              onChange={handleInputChange}
              placeholder="e.g., Flat 502, Pearl Residency"
              className={`${inputClasses} ${errors.houseNumber ? errorClasses : 'border-[#d6cdbf]'}`}
              aria-invalid={errors.houseNumber ? "true" : "false"}
              aria-describedby={errors.houseNumber ? "houseNumber-error" : undefined}
            />
            {errors.houseNumber && <p id="houseNumber-error" className="text-red-500 text-xs mt-1 font-serif italic">{errors.houseNumber}</p>}
          </div>

          <div>
            <label htmlFor="streetArea" className={labelClasses}>Street / Area / Locality *</label>
            <input
              type="text"
              id="streetArea"
              name="streetArea"
              value={formData.streetArea}
              onChange={handleInputChange}
              placeholder="e.g., Lajpat Nagar, Near City Mall"
              className={`${inputClasses} ${errors.streetArea ? errorClasses : 'border-[#d6cdbf]'}`}
              aria-invalid={errors.streetArea ? "true" : "false"}
              aria-describedby={errors.streetArea ? "streetArea-error" : undefined}
            />
            {errors.streetArea && <p id="streetArea-error" className="text-red-500 text-xs mt-1 font-serif italic">{errors.streetArea}</p>}
          </div>
        </div>

        {/* Landmark */}
        <div>
          <label htmlFor="landmark" className={labelClasses}>Landmark (Optional)</label>
          <input
            type="text"
            id="landmark"
            name="landmark"
            value={formData.landmark}
            onChange={handleInputChange}
            placeholder="e.g., Opposite SBI ATM"
            className={`${inputClasses} border-[#d6cdbf]`}
          />
        </div>

        {/* Address Type */}
        <div>
          <label className={labelClasses}>Address Type</label>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {addressTypeOptions.map(({ value, label, icon: Icon }) => (
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
                  className={`
                    px-3 py-1.5 sm:px-4 sm:py-2 rounded-md sm:rounded-lg border text-sm font-serif italic
                    flex items-center gap-2
                    transition-all duration-200 ease-in-out
                    ${formData.addressType === value
                      ? 'border-[#AA732F] bg-[#fdf8f1] text-rich-brown shadow-sm'
                      : 'border-[#d6cdbf] hover:border-[#DEC9A3] text-rich-brown'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Set as Default Checkbox */}
        <div className="flex items-center mt-2">
          <input
            type="checkbox"
            id="isDefault"
            name="isDefault"
            checked={formData.isDefault}
            onChange={handleInputChange}
            className="h-4 w-4 text-[#AA732F] focus:ring-[#DEC9A3] border-gray-300 rounded"
          />
          <label htmlFor="isDefault" className="ml-2 block text-sm sm:text-base text-rich-brown font-serif italic cursor-pointer">
            Set as default address
          </label>
        </div>

        {/* Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 sm:pt-6 border-t border-[#e9e2d1]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="
              w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-2.5 text-sm rounded-lg
              bg-[#f0ece2] text-[#4A3F36]
              hover:bg-[#e3dcc9] transition-colors duration-200
              font-serif italic flex items-center justify-center
            "
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="
              w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-2.5 bg-[#AA732F] text-white text-sm rounded-lg
              hover:bg-[#8f5c20] transition-colors duration-200
              flex items-center justify-center space-x-2 font-serif italic
            "
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
