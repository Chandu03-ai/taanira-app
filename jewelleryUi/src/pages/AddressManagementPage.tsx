import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import AddressSelector from '../components/address/AddressSelector';
import AddressForm from '../components/address/AddressForm';
import SEOHead from '../components/seo/SEOHead';
import { SITE_CONFIG } from '../constants/siteConfig';
import Header from '../components/common/Header';
import { AddressFormData } from '../types/address';

const AddressManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const handleAddAddressClick = () => {
    setIsAddressFormOpen(true);
  };

  const handleCloseAddressForm = () => {
    setIsAddressFormOpen(false);
  };

  const handleSaveAddress = async (addressData: AddressFormData) => {
    setIsSavingAddress(true);
    console.log('Saving address:', addressData);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSavingAddress(false);
    setIsAddressFormOpen(false); // Close modal after successful save
    // In a real app, you would dispatch an action to save to your backend
    // and then refresh the address list in AddressSelector.
    alert('Address saved successfully!');
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
            <AddressSelector showTitle={false} />
          </div>
        </div>
      </main>

      {/* Address Form Modal */}
      <AddressForm
        isOpen={isAddressFormOpen}
        onClose={handleCloseAddressForm}
        onSave={handleSaveAddress}
        loading={isSavingAddress}
        address={null} // For adding a new address, pass null
      />
    </>
  );
};

export default AddressManagementPage;
