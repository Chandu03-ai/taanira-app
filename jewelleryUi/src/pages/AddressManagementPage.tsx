import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import AddressSelector from '../components/address/AddressSelector';
import AddressForm from '../components/address/AddressForm';
import SEOHead from '../components/seo/SEOHead';
import { SITE_CONFIG } from '../constants/siteConfig';
import Header from '../components/common/Header';
import { AddressFormData, Address } from '../types/address';
import { useAddressStore } from '../store/addressStore'; // Import the address store

const AddressManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null); // State to hold address being edited

  // Get store actions and state
  const { addAddress, updateAddress, loadAddresses, loading: storeLoading } = useAddressStore();

  // Use a local loading state for form submission to avoid conflicts with global store loading
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    // Load addresses when the component mounts
    loadAddresses();
  }, [loadAddresses]);

  const handleAddAddressClick = () => {
    setEditingAddress(null); // Ensure we're adding a new address
    setIsAddressFormOpen(true);
  };

  const handleEditAddressClick = (address: Address) => {
    setEditingAddress(address);
    setIsAddressFormOpen(true);
  };

  const handleCloseAddressForm = () => {
    setIsAddressFormOpen(false);
    setEditingAddress(null); // Clear editing address when form closes
  };

  const handleSaveAddress = async (addressData: AddressFormData) => {
    setFormLoading(true);
    try {
      if (editingAddress) {
        // Update existing address
        await updateAddress(editingAddress.id, addressData);
        alert('Address updated successfully!');
      } else {
        // Add new address
        await addAddress(addressData);
        alert('Address added successfully!');
      }
      handleCloseAddressForm(); // Close modal after successful save
    } catch (error) {
      console.error('Failed to save address:', error);
      alert(`Failed to save address: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title={`Manage Addresses - ${SITE_CONFIG.name}`}
        description="Manage your delivery addresses for jewelry orders"
      />

      <Header />

      <main className="min-h-screen pt-24 pb-10 bg-gradient-to-b from-white to-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Top Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-sm font-medium text-[#4A3F36] hover:text-gray-700 transition"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Back</span>
            </button>

            <h1 className="text-xl sm:text-2xl font-semibold text-[#4A3F36] text-center sm:text-left">
              Manage Addresses
            </h1>

            {/* Add New Address Button */}
            <button
              onClick={handleAddAddressClick}
              className="
                flex items-center px-4 py-2 bg-[#AA732F] text-white rounded-lg shadow-md
                hover:bg-[#8f5c20] transition-colors duration-200
                text-sm font-serif italic
              "
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Address
            </button>
          </div>

          {/* Address Selector */}
          <div className="bg-white/90 backdrop-blur-md border border-gray-100 rounded-2xl shadow-md p-5 sm:p-8">
            <AddressSelector showTitle={false} onEditAddress={handleEditAddressClick} />
          </div>
        </div>
      </main>

      {/* Address Form Modal */}
      <AddressForm
        isOpen={isAddressFormOpen}
        onClose={handleCloseAddressForm}
        onSave={handleSaveAddress}
        loading={formLoading} // Use local loading state for the form
        address={editingAddress} // Pass the address for editing, or null for new
      />
    </>
  );
};

export default AddressManagementPage;
