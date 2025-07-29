import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import AddressSelector from '../components/address/AddressSelector';
import AddressForm from '../components/address/AddressForm';
import SEOHead from '../components/seo/SEOHead';
import { SITE_CONFIG } from '../constants/siteConfig';
import Header from '../components/common/Header';
import { AddressFormData, Address } from '../types/address';
import { useAddressStore } from '../store/addressStore';

const AddressManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const { addAddress, updateAddress, loadAddresses } = useAddressStore();

  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const handleAddAddressClick = () => {
    setEditingAddress(null);
    setIsAddressFormOpen(true);
  };

  const handleEditAddressClick = (address: Address) => {
    setEditingAddress(address);
    setIsAddressFormOpen(true);
  };

  const handleCloseAddressForm = () => {
    setIsAddressFormOpen(false);
    setEditingAddress(null);
  };

  const handleSaveAddress = async (addressData: AddressFormData) => {
    setFormLoading(true);
    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, addressData);
      } else {
        await addAddress(addressData);
      }
      handleCloseAddressForm();
    } catch (error) {
      console.error('Failed to save address:', error);
      throw error;
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-[#4A3F36] hover:text-[#AA732F] transition-colors duration-200 text-sm sm:text-base font-serif italic"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>

            <h1 className="text-xl sm:text-2xl font-semibold text-[#4A3F36] text-center sm:text-left">
              Manage Addresses
            </h1>

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

          <div className="bg-white/90 backdrop-blur-md border border-gray-100 rounded-2xl shadow-md p-5 sm:p-8">
            <AddressSelector showTitle={false} onEditAddress={handleEditAddressClick} />
          </div>
        </div>
      </main>

      <AddressForm
        isOpen={isAddressFormOpen}
        onClose={handleCloseAddressForm}
        onSave={handleSaveAddress}
        loading={formLoading}
        address={editingAddress}
      />
    </>
  );
};

export default AddressManagementPage;