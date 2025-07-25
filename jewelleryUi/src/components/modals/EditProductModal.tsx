import React, { useState, useEffect } from 'react';
import { Product } from '../../types';

interface EditProductModalProps {
  product: Product | null;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ product, onSave, onCancel }) => {
  const [editedProduct, setEditedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (product) {
      setEditedProduct(product);
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editedProduct) {
      setEditedProduct({
        ...editedProduct,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSave = () => {
    if (editedProduct) {
      onSave(editedProduct);
    }
  };

  if (!editedProduct) {
    return null; // If no product is passed, don't render the modal
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Edit Product</h2>
        <label>
          Product Name:
          <input
            type="text"
            name="name"
            value={editedProduct.name}
            onChange={handleChange}
          />
        </label>
        <label>
          Price:
          <input
            type="number"
            name="price"
            value={editedProduct.price}
            onChange={handleChange}
          />
        </label>
        {/* Add more fields as necessary */}
        <div>
          <button onClick={handleSave}>Save</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
