import React, { useState, useEffect } from 'react';
import { Plus, MapPin } from 'lucide-react';
import { useAddressStore } from '../../store/addressStore';
import { useAuthStore } from '../../store/authStore';
import { Address } from '../../types/address';
import AddressCard from './AddressCard';
import AddressForm from './AddressForm';
import ConfirmDialog from '../common/ConfirmDialog';

interface AddressSelectorProps {
  onAddressSelect?: (address: Address) => void;
  selectedAddressId?: string;
  showTitle?: boolean;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
  onAddressSelect,
  selectedAddressId,
  showTitle = true
}) => {
  const { isAuthenticated } = useAuthStore();
  const {
    addresses,
    selectedAddress,
    loading,
    addAddress,
    updateAddress,
    deleteAddress,
    setSelectedAddress,
    setDefaultAddress,
    loadAddresses
  } = useAddressStore();

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    address: Address | null;
  }>({ isOpen: false, address: null });

  useEffect(() => {
    if (isAuthenticated) {
      console.log('User authenticated, loading user-specific addresses...');
      loadAddresses();
    } else {
      console.log('User not authenticated, clearing addresses');
      // Clear addresses when user logs out
      const { clearAddresses } = useAddressStore.getState();
      clearAddresses();
    }
  }, [isAuthenticated, loadAddresses]);

  // Set selected address based on prop
  useEffect(() => {
    if (selectedAddressId) {
      const address = addresses.find(addr => addr.id === selectedAddressId);
      if (address) {
        setSelectedAddress(address);
      }
    }
  }, [selectedAddressId, addresses, setSelectedAddress]);

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
    onAddressSelect?.(address);
  };

  const handleAddAddress = async (addressData: any) => {
    try {
      await addAddress(addressData);
      setShowAddressForm(false);
    } catch (error) {
      console.error('Error adding address:', error);
      // Error will be shown in the form component
    }
  };

  const handleEditAddress = async (addressData: any) => {
    if (editingAddress) {
      try {
        await updateAddress(editingAddress.id, addressData);
        setEditingAddress(null);
        setShowAddressForm(false);
      } catch (error) {
        console.error('Error updating address:', error);
        // Error will be shown in the form component
      }
    }
  };

  const handleDeleteAddress = async () => {
    if (deleteDialog.address) {
      try {
        await deleteAddress(deleteDialog.address.id);
        setDeleteDialog({ isOpen: false, address: null });
      } catch (error) {
        console.error('Error deleting address:', error);
        alert('Failed to delete address. Please try again.');
      }
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await setDefaultAddress(addressId);
    } catch (error) {
      console.error('Error setting default address:', error);
      alert('Failed to set default address. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-8">
        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Please Login</h3>
        <p className="text-gray-600">You need to be logged in to manage addresses.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 sm:space-y-10 lg:space-y-12">
    {showTitle && (
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif italic text-[#5f3c2c] mb-3">
          ✨ Where should we deliver your jewelry?
        </h2>
        <p className="text-sm sm:text-base font-light text-[#5f3c2c] max-w-xl mx-auto px-4">
          To ensure safe and timely delivery of your precious order, please choose a saved address or add a new one.
        </p>
      </div>
    )}

    {/* Saved Addresses */}
    {addresses.length > 0 && (
      <div className="px-4 sm:px-0">
        <h3 className="text-base sm:text-lg lg:text-xl font-serif text-[#5f3c2c] mb-2 flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
           Saved Addresses
        </h3>
        <p className="text-sm font-light text-[#5f3c2c] mb-4 lg:mb-6">
          Select one of your saved delivery addresses below. You can edit or remove any address, or add a new one if needed.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              isSelected={selectedAddress?.id === address.id}
              onSelect={() => handleAddressSelect(address)}
              onEdit={() => {
                setEditingAddress(address);
                setShowAddressForm(true);
              }}
              onDelete={() => setDeleteDialog({ isOpen: true, address })}
              onSetDefault={() => handleSetDefault(address.id)}
              showSelectButton={true}
            />
          ))}
        </div>
      </div>
    )}

    {/* Add New Address */}
    <div className="text-center px-4 sm:px-0">
      {addresses.length === 0 ? (
        <div className="py-8 lg:py-10">
          <MapPin className="h-10 w-10 text-[#aa732f] mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-serif text-[#5f3c2c] mb-2">No addresses found</h3>
          <p className="text-sm text-[#5f3c2c] font-light mb-6 max-w-md mx-auto">
            Don&apos;t see your delivery location? Add a new address to continue.
          </p>
        </div>
      ) : (
        <div className="border-t pt-6 lg:pt-8">
          <p className="text-sm font-light text-[#5f3c2c] mb-4 max-w-md mx-auto">
            Don&apos;t see your delivery location? Add a new address to continue.
          </p>
        </div>
      )}

      <button
        onClick={() => {
          setEditingAddress(null);
          setShowAddressForm(true);
        }}
        className="bg-[#DEC9A3] text-[#5f3c2c] px-6 py-2.5 rounded-md text-sm sm:text-base font-semibold hover:bg-[#d1b990] transition-colors flex items-center justify-center space-x-2 mx-auto min-w-[160px]"
        title="Add new delivery address"
      >
        <Plus className="h-5 w-5" />
        <span>Add New Address</span>
      </button>
    </div>



    {/* Address Form Dialog */}
    <AddressForm
      isOpen={showAddressForm}
      onClose={() => {
        setShowAddressForm(false);
        setEditingAddress(null);
      }}
      onSave={editingAddress ? handleEditAddress : handleAddAddress}
      address={editingAddress}
      loading={loading}
    />

    {/* Delete Confirmation Dialog */}
    <ConfirmDialog
      isOpen={deleteDialog.isOpen}
      onClose={() => setDeleteDialog({ isOpen: false, address: null })}
      onConfirm={handleDeleteAddress}
      title="Delete Address"
      message={`Are you sure you want to delete this address for ${deleteDialog.address?.fullName}?`}
      confirmText="Delete"
      type="danger"
      loading={loading}
    />
    </div>
  );

};

export default AddressSelector;