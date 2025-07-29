import React from 'react';
import { Home, Building, MapPin, Edit, Trash2, Check } from 'lucide-react';
import { Address } from '../../types/address';

interface AddressCardProps {
  address: Address;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSetDefault?: () => void;
  showActions?: boolean;
  showSelectButton?: boolean;
}

const AddressCard: React.FC<AddressCardProps> = ({
  address,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
  showActions = true,
  showSelectButton = false,
}) => {
  const getAddressTypeIcon = () => {
    switch (address.addressType) {
      case 'home':
        return <Home className="h-4 w-4" />;
      case 'office':
        return <Building className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getAddressTypeLabel = () => {
    switch (address.addressType) {
      case 'home':
        return '🏡 Home';
      case 'office':
        return '🏢 Office';
      default:
        return '📦 Other';
    }
  };

  return (
    <div
      className={`w-full border rounded-xl p-4 sm:p-6 transition-all duration-200 ${
        isSelected
          ? 'border-soft-gold bg-rose-sand/20 shadow-md'
          : 'border-subtle-beige hover:border-soft-gold hover:shadow-sm'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center flex-wrap gap-2 mb-2 text-sm font-serif italic text-rich-brown">
            {getAddressTypeIcon()}
            <span className="font-semibold">{getAddressTypeLabel()}</span>
            {address.isDefault && (
              <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-xl font-serif font-semibold italic whitespace-nowrap">
                Default
              </span>
            )}
          </div>

          <div className="mb-2">
            <h3 className="font-serif font-semibold italic text-rich-brown truncate">{address.fullName}</h3>
            <p className="text-sm font-serif text-rich-brown font-light">{address.mobileNumber}</p>
          </div>

          <div className="text-sm font-serif text-rich-brown leading-relaxed font-light space-y-1">
            <p className="break-words">{address.houseNumber}</p>
            <p className="break-words">{address.streetArea}</p>
            {address.landmark && <p className="break-words">Landmark: {address.landmark}</p>}
            <p>
              {address.city}, {address.state} - {address.pincode}
            </p>
          </div>
        </div>

        {showActions && (
          <div className="flex sm:flex-col items-center sm:items-start gap-2 sm:ml-4 flex-shrink-0">
            {onEdit && (
              <button
                onClick={onEdit}
                title="Edit address"
                className="p-2 text-rich-brown hover:text-mocha hover:bg-rose-sand/20 rounded-xl transition-all duration-200 ease-in-out"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                title="Delete address"
                className="p-2 text-rich-brown hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 ease-in-out"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-4 pt-4 border-t border-subtle-beige gap-3">
        {!address.isDefault && onSetDefault && (
          <button
            onClick={onSetDefault}
            className="text-sm text-mocha hover:text-rich-brown font-serif font-semibold italic transition-all duration-200 ease-in-out"
            title="Set as default address"
          >
            Set as Default
          </button>
        )}

        {showSelectButton && onSelect && (
          <button
            onClick={onSelect}
            className={`px-4 py-3 rounded-xl font-serif font-semibold italic text-sm transition-all duration-200 ease-in-out w-full sm:w-auto shadow-sm hover:shadow-md ${
              isSelected
                ? 'bg-mocha text-white'
                : 'bg-soft-gold text-rich-brown hover:bg-rose-sand'
            }`}
            title={isSelected ? 'Selected for delivery' : 'Select this address'}
          >
            {isSelected ? (
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4" />
                <span>Selected</span>
              </span>
            ) : (
              'Deliver Here'
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default AddressCard;