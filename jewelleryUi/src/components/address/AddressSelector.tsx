import React, { useEffect, useState } from 'react';
import { MapPin, Home, Building, CheckCircle, Trash2, Edit, Loader } from 'lucide-react';
import { useAddressStore } from '../../store/addressStore';
import { Address } from '../../types/address';
import ConfirmationDialog from '../common/ConfirmDialog';

interface AddressSelectorProps {
  showTitle?: boolean;
  onEditAddress?: (address: Address) => void;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({ showTitle = true, onEditAddress }) => {
  const {
    addresses,
    selectedAddress,
    loading,
    loadAddresses,
    setSelectedAddress,
    setDefaultAddress,
    deleteAddress,
  } = useAddressStore();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const [individualActionLoadingId, setIndividualActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const getAddressTypeIcon = (type: 'home' | 'office' | 'other') => {
    switch (type) {
      case 'home':
        return <Home className="w-4 h-4 text-[#AA732F]" />;
      case 'office':
        return <Building className="w-4 h-4 text-[#AA732F]" />;
      case 'other':
        return <MapPin className="w-4 h-4 text-[#AA732F]" />;
      default:
        return <MapPin className="w-4 h-4 text-[#AA732F]" />;
    }
  };

  const handleDeleteClick = (address: Address) => {
    setAddressToDelete(address);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!addressToDelete) return;

    setIndividualActionLoadingId(addressToDelete.id);
    try {
      await deleteAddress(addressToDelete.id);
    } catch (error) {
      console.error('Error deleting address:', error);
    } finally {
      setIsDeleteDialogOpen(false);
      setAddressToDelete(null);
      setIndividualActionLoadingId(null);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    setIndividualActionLoadingId(addressId);
    try {
      await setDefaultAddress(addressId);
      const newlyDefaultAddress = addresses.find(addr => addr.id === addressId);
      if (newlyDefaultAddress) {
        setSelectedAddress(newlyDefaultAddress);
      }
    } catch (error) {
      console.error('Error setting default address:', error);
    } finally {
      setIndividualActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-[#4A3F36]">
        <Loader className="w-8 h-8 animate-spin mb-3" />
        <span className="text-lg font-serif italic">Loading addresses...</span>
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="text-center py-10 text-[#4A3F36] font-serif italic">
        <p className="text-lg mb-4">No addresses found.</p>
        <p className="text-sm">Click "Add New Address" to add your first delivery address.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <h2 className="text-xl sm:text-2xl font-semibold text-[#4A3F36] mb-6 font-serif italic">Select Delivery Address</h2>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {addresses.map((address) => (
          <div
            key={address.id}
            onClick={() => {
              if (!address.isDefault && individualActionLoadingId !== address.id) {
                handleSetDefault(address.id);
              }
            }}
            className={`
              relative p-4 sm:p-6 border rounded-xl shadow-sm cursor-pointer
              transition-all duration-200 ease-in-out
              ${selectedAddress?.id === address.id
                ? 'border-[#AA732F] ring-2 ring-[#DEC9A3] bg-[#fdf8f1]'
                : 'border-gray-200 hover:border-gray-300 bg-white'
              }
            `}
          >
            {selectedAddress?.id === address.id && (
              <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-[#10b981]" />
            )}

            <div className="flex items-center mb-3">
              {getAddressTypeIcon(address.addressType)}
              <span className="ml-2 text-base font-semibold text-[#4A3F36] capitalize font-serif italic">
                {address.addressType}
              </span>
              {address.isDefault && (
                <span className="ml-3 px-2 py-0.5 text-xs font-medium bg-[#DEC9A3] text-[#4A3F36] rounded-full font-serif italic">
                  Default
                </span>
              )}
            </div>

            <div className="mb-4">
              <p className="text-sm sm:text-base text-[#4A3F36] font-medium mb-1 font-serif italic">{address.fullName}</p>
              <div className="text-sm text-gray-600 font-serif italic space-y-1">
                <p>{address.houseNumber}</p>
                <p>{address.streetArea}</p>
                {address.landmark && <p>Landmark: {address.landmark}</p>}
                <p>{address.city}, {address.state} - {address.pincode}</p>
                <p>Mobile: {address.mobileNumber}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
              {!address.isDefault && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetDefault(address.id);
                  }}
                  disabled={individualActionLoadingId === address.id}
                  className="
                    flex items-center text-xs sm:text-sm text-[#AA732F] hover:text-[#8f5c20]
                    transition-colors duration-200 font-serif italic
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  {individualActionLoadingId === address.id ? (
                    <Loader className="w-3 h-3 animate-spin mr-1" />
                  ) : (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  )}
                  Set as Default
                </button>
              )}
              
              <div className="flex items-center gap-3">
                {onEditAddress && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditAddress(address);
                    }}
                    className="
                      flex items-center text-xs sm:text-sm text-[#4A3F36] hover:text-gray-700
                      transition-colors duration-200 font-serif italic
                    "
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(address);
                  }}
                  disabled={individualActionLoadingId === address.id}
                  className="
                    flex items-center text-xs sm:text-sm text-red-500 hover:text-red-700
                    transition-colors duration-200 font-serif italic
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  {individualActionLoadingId === address.id ? (
                    <Loader className="w-3 h-3 animate-spin mr-1" />
                  ) : (
                    <Trash2 className="w-3 h-3 mr-1" />
                  )}
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setIndividualActionLoadingId(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete the address for ${addressToDelete?.fullName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={individualActionLoadingId === addressToDelete?.id}
      />
    </div>
  );
};

export default AddressSelector;