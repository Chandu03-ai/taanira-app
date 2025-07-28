import React, { useEffect, useState } from 'react';
import { MapPin, Home, Building, CheckCircle, Trash2, Edit, Loader } from 'lucide-react';
import { useAddressStore } from '../../store/addressStore';
import { Address } from '../../types/address';
import ConfirmationDialog from '../common/ConfirmDialog'; // Assuming you have this component

interface AddressSelectorProps {
  showTitle?: boolean;
  onEditAddress?: (address: Address) => void; // New prop for editing
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
  const [actionLoading, setActionLoading] = useState<string | null>(null); // To show loading on specific actions

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
    if (addressToDelete) {
      setActionLoading(addressToDelete.id); // Set loading for this specific address
      try {
        await deleteAddress(addressToDelete.id);
        alert('Address deleted successfully!');
      } catch (error) {
        console.error('Error deleting address:', error);
        alert(`Failed to delete address: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsDeleteDialogOpen(false);
        setAddressToDelete(null);
        setActionLoading(null);
      }
    }
  };

  const handleSetDefault = async (addressId: string) => {
    setActionLoading(addressId);
    try {
      await setDefaultAddress(addressId);
      alert('Default address updated!');
    } catch (error) {
      console.error('Error setting default address:', error);
      alert(`Failed to set default address: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10 text-[#4A3F36]">
        <Loader className="w-8 h-8 animate-spin mr-3" />
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
        <h2 className="text-xl font-semibold text-[#4A3F36] mb-6 font-serif italic">Select Delivery Address</h2>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {addresses.map((address) => (
          <div
            key={address.id}
            className={`
              relative p-4 sm:p-6 border rounded-xl shadow-sm cursor-pointer
              transition-all duration-200 ease-in-out
              ${selectedAddress?.id === address.id
                ? 'border-[#AA732F] ring-2 ring-[#DEC9A3] bg-[#fdf8f1]'
                : 'border-gray-200 hover:border-gray-300 bg-white'
              }
            `}
            onClick={() => setSelectedAddress(address)}
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

            <p className="text-sm text-[#4A3F36] font-medium mb-1 font-serif italic">{address.fullName}</p>
            <p className="text-sm text-gray-600 font-serif italic">
              {address.houseNumber}, {address.streetArea}, {address.landmark && `${address.landmark}, `}
              {address.city}, {address.state} - {address.pincode}
            </p>
            <p className="text-sm text-gray-600 mt-1 font-serif italic">Mobile: {address.mobileNumber}</p>

            <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-gray-100">
              {!address.isDefault && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent selecting address when clicking this button
                    handleSetDefault(address.id);
                  }}
                  disabled={actionLoading === address.id}
                  className="
                    flex items-center text-xs text-[#AA732F] hover:text-[#8f5c20]
                    transition-colors duration-200 font-serif italic
                  "
                >
                  {actionLoading === address.id ? (
                    <Loader className="w-3 h-3 animate-spin mr-1" />
                  ) : (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  )}
                  Set as Default
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditAddress?.(address); // Call the new edit handler
                }}
                className="
                  flex items-center text-xs text-[#4A3F36] hover:text-gray-700
                  transition-colors duration-200 font-serif italic
                "
              >
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(address);
                }}
                disabled={actionLoading === address.id}
                className="
                  flex items-center text-xs text-red-500 hover:text-red-700
                  transition-colors duration-200 font-serif italic
                "
              >
                {actionLoading === address.id ? (
                  <Loader className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <Trash2 className="w-3 h-3 mr-1" />
                )}
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete the address for ${addressToDelete?.fullName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"   
        type="danger"        
        loading={actionLoading === addressToDelete?.id}
      />
    </div>
  );
};

export default AddressSelector;