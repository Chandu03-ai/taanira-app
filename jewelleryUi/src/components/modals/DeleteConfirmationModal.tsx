import React from 'react';
import { Product } from '../../types';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;  // Allow null
  onDelete: (productId: string) => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, product, onDelete }) => {
  if (!isOpen || !product) return null; // Don't render the modal if product is null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-xl font-semibold text-gray-800">Confirm Deletion</h2>
        <p className="mt-2 text-sm text-gray-600">Are you sure you want to delete the product "{product.name}"?</p>
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="text-gray-500 mr-4">Cancel</button>
          <button onClick={() => onDelete(product.id)} className="bg-red-600 text-white py-2 px-6 rounded-lg">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
