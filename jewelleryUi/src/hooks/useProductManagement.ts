import { useState, useEffect } from 'react';
import { Product, Category, ProductImport } from '../types';
import { NotificationState, DeleteDialogState, EditDialogState } from '../types/admin';
import { apiService } from '../services/api';

export const useProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [notification, setNotification] = useState<NotificationState>({
    message: '',
    type: 'info',
    isVisible: false
  });

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setNotification({
      message,
      type,
      isVisible: true
    });
  };

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        apiService.getProducts(),
        apiService.getCategories(),
      ]);
      setProducts(productsRes || []);
      setCategories(categoriesRes || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setProducts([]);
      setCategories([]);
      showNotification('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSave = async (productData: Partial<Product>) => {
    setActionLoading(true);
    try {
      if (productData.id) {
        await apiService.updateProduct(productData.id, productData);
        showNotification('Product updated successfully!', 'success');
      } else {
        if (
          productData.name &&
          productData.category &&
          typeof productData.price === 'number' &&
          typeof productData.initialPrice === 'number'
        ) {
          const productToCreate: ProductImport = {
            name: productData.name,
            slug: productData.slug,
            category: productData.category,
            description: productData.description,
            details: productData.details, // Added details field
            price: productData.price,
            initialPrice: productData.initialPrice,
            comparePrice: productData.comparePrice,
            images: productData.images,
            stock: productData.stock,
            isLatest:productData.isLatest,
            review:productData.review,
            isHalfPaymentAvailable: productData.isHalfPaymentAvailable,
            halfPaymentAmount: productData.halfPaymentAmount,
          };

          await apiService.createProduct(productToCreate);
          showNotification('Product created successfully!', 'success');
        } else {
          throw new Error('Missing required product fields for creation.');
        }
      }

      await loadData();
    } catch (error) {
      console.error('Error updating/creating product:', error);
      showNotification(productData.id ? 'Error updating product' : 'Error creating product', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAllProducts = async () => {
    try {
      setActionLoading(true);
      await apiService.deleteProducts();
      await loadData();
      showNotification('All products deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting all products:', error);
      showNotification('Error deleting all products', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSingleProduct = async (productId: string) => {
    try {
      setActionLoading(true);
      await apiService.deleteProductById(productId);
      await loadData();
      showNotification('Product deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting product:', error);
      showNotification('Error deleting product', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      setActionLoading(true);
      await Promise.all(selectedProducts.map(id => apiService.deleteProductById(id)));
      setSelectedProducts([]);
      await loadData();
      showNotification(`Deleted ${selectedProducts.length} products`, 'success');
    } catch (error) {
      console.error('Error bulk deleting products:', error);
      showNotification('Error deleting products', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = (filteredProducts: Product[]) => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    products,
    categories,
    loading,
    actionLoading,
    selectedProducts,
    notification,
    showNotification,
    setNotification,
    loadData,
    handleProductSave,
    handleDeleteAllProducts,
    handleDeleteSingleProduct,
    handleBulkDelete,
    handleSelectProduct,
    handleSelectAll,
  };
};