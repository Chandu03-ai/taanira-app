import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AddressSelector from '../components/address/AddressSelector';
import SEOHead from '../components/seo/SEOHead';
import { SITE_CONFIG } from '../constants/siteConfig';
import Header from '../components/common/Header';

const AddressManagementPage: React.FC = () => {
  const navigate = useNavigate();

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

            <div className="w-6 h-6" /> {/* spacer for symmetry */}
          </div>

          {/* Address Selector */}
          <div className="bg-white/90 backdrop-blur-md border border-gray-100 rounded-2xl shadow-md p-5 sm:p-8">
            <AddressSelector showTitle={false} />
          </div>
        </div>
      </main>
    </>
  );
};

export default AddressManagementPage;
