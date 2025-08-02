import React, { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Search,
} from 'lucide-react';
import { DeleteDialogState, EditDialogState } from '../../types/admin';
import LoadingSpinner from '../common/LoadingSpinner';
import ProductDialog from './ProductDialog';
import NotificationToast from './NotificationToast';
import ConfirmDialog from '../common/ConfirmDialog';
import SEOHead from '../seo/SEOHead';
import { SITE_CONFIG, staticImageBaseUrl } from '../../constants/siteConfig';
import { useProductManagement } from '../../hooks/useProductManagement';
import { formatReadableDate } from '../../utils/dateUtils';

const ProductManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');

  // Dialog states
  const [editDialog, setEditDialog] = useState<EditDialogState>({ isOpen: false, product: null });
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({ isOpen: false, type: 'product', item: null });

  const {
    products,
    categories,
    loading,
    actionLoading,
    selectedProducts,
    notification,
    setNotification,
    handleProductSave,
    handleDeleteAllProducts,
    handleDeleteSingleProduct,
    handleBulkDelete,
    handleSelectProduct,
    handleSelectAll,
  } = useProductManagement();
  // Filter products based on search and category
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const aTimestamp = parseInt(a.createdAt);
      const bTimestamp = parseInt(b.createdAt);
      return sortOrder === 'latest'
        ? bTimestamp - aTimestamp
        : aTimestamp - bTimestamp;
    });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <SEOHead
        title={`Product Management - ${SITE_CONFIG.name}`}
        description="Manage your jewelry store inventory and products"
      />

      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-2xl font-bold text-[#5f3c2c]">
              Product Management
            </h2>
            <p className="text-[#8f674b] mt-1">
              Manage your jewelry inventory ({filteredProducts.length} products)
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {selectedProducts.length > 0 && (
              <button
                onClick={() =>
                  setDeleteDialog({
                    isOpen: true,
                    type: 'bulk',
                    item: null,
                  })
                }
                className="bg-red-600 text-white px-4 py-2 rounded-md shadow hover:bg-red-700 transition flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Selected ({selectedProducts.length})</span>
              </button>
            )}
            <button
              onClick={() => setEditDialog({ isOpen: true, product: null })}
              className="bg-[#d2b79f] text-[#4d2e1f] px-4 py-2 rounded-md shadow hover:opacity-90 transition flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </button>
            <button
              onClick={() =>
                setDeleteDialog({
                  isOpen: true,
                  type: 'bulk',
                  item: null,
                })
              }
              className="border border-red-600 text-red-600 px-4 py-2 rounded-md hover:bg-red-50 transition flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete All</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-5">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-[#D4B896]"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-[#D4B896]"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.name} value={category.name}>{category.name}</option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-48">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'latest' | 'oldest')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-[#D4B896]"
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="relative mx-4 sm:mx-0">
            <div className="max-h-[560px] overflow-y-auto border rounded-lg shadow-sm">
              <table className="min-w-full table-fixed divide-y divide-[#eadacd]">
                {/* Column width definitions */}
                <colgroup>
                  <col style={{ width: '4%' }} />
                  <col style={{ width: '30%' }} />
                  <col style={{ width: '18%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '18%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '8%' }} />

                </colgroup>

                {/* Table Header */}
                <thead className="bg-[#f5e9dc] sticky top-0">
                  <tr>
                    <th className="px-2 py-3 text-left text-xs font-medium text-[#5f3c2c] uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                        onChange={() => handleSelectAll(filteredProducts)}
                        className="rounded border-gray-300 text-[#5f3c2c] focus:ring-[#D4B896]"
                      />
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-[#5f3c2c] uppercase tracking-wider">Product</th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-[#5f3c2c] uppercase tracking-wider">Category</th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-[#5f3c2c] uppercase tracking-wider">Price</th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-[#5f3c2c] uppercase tracking-wider">Updated</th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-[#5f3c2c] uppercase tracking-wider">Stock</th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-[#5f3c2c] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="bg-white">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className={selectedProducts.includes(product.id) ? 'bg-[#F4E1D2]' : ''}>
                      <td className="px-2 py-4 align-middle">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className="rounded border-gray-300 text-[#5f3c2c] focus:ring-[#D4B896]"
                        />
                      </td>
                      <td className="px-2 py-4 align-middle">
                        <div className="flex items-center">
                          <img
                            src={
                              product.images?.[0]?.startsWith('http')
                                ? product.images[0]
                                : `${staticImageBaseUrl}/${product.images[0]}` || 'https://via.placeholder.com/40'
                            }
                            alt={product.name}
                            className="h-10 w-10 rounded object-cover flex-shrink-0"
                          />
                          <div className="ml-3 min-w-0 flex-1">
                            <div className="text-sm font-medium text-[#5f3c2c] line-clamp-2">{product.name}</div>
                            <div className="md:hidden text-xs text-[#8f674b] mt-1">{product.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-4 align-middle text-xs text-[#5f3c2c]">{product.category}</td>
                      <td className="px-2 py-4 align-middle">
                        <div className="text-sm font-medium text-[#5f3c2c]">₹{(product.price || 0).toLocaleString()}</div>
                        {product.isHalfPaymentAvailable && (
                          <div className="text-xs text-green-600">
                            Half: ₹{(product.halfPaymentAmount || 0).toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-4 align-middle text-xs text-[#5f3c2c] whitespace-nowrap">
                        {formatReadableDate(product.updatedAt)}
                      </td>
                      <td className="px-2 py-4 align-middle text-xs font-medium text-[#5f3c2c]">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {product.stock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-2 py-4 align-middle text-xs font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditDialog({ isOpen: true, product })}
                            className="text-[#d2b79f] hover:text-[#5f3c2c]"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteDialog({
                                isOpen: true,
                                type: 'product',
                                item: product,
                                productId: product.id,
                                productName: product.name,
                              })
                            }
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>



        {/* Edit Product Dialog */}
        <ProductDialog
          isOpen={editDialog.isOpen}
          onClose={() => setEditDialog({ isOpen: false, product: null })}
          onSave={handleProductSave}
          product={editDialog.product}
          mode={editDialog.product ? 'edit' : 'add'}
          categories={categories}
          loading={actionLoading}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, type: 'product', item: null })}
          onConfirm={() => {
            const closeDialog = () =>
              setDeleteDialog({ isOpen: false, type: 'product', item: null });

            if (deleteDialog.type === 'product' && deleteDialog.productId) {
              handleDeleteSingleProduct(deleteDialog.productId).then(closeDialog);
            } else if (deleteDialog.type === 'bulk' && selectedProducts.length > 0) {
              handleBulkDelete().then(closeDialog);
            } else if (deleteDialog.type === 'bulk' && deleteDialog.item === null) {
              handleDeleteAllProducts().then(closeDialog);
            }
          }}
          title={
            deleteDialog.type === 'bulk' && selectedProducts.length > 0
              ? `Delete ${selectedProducts.length} Products`
              : deleteDialog.type === 'bulk'
                ? 'Delete All Products'
                : 'Delete Product'
          }
          message={
            deleteDialog.type === 'bulk' && selectedProducts.length > 0
              ? `Are you sure you want to delete ${selectedProducts.length} selected products? This action cannot be undone.`
              : deleteDialog.type === 'bulk'
                ? 'Are you sure you want to delete ALL products? This action cannot be undone and will remove all product data permanently.'
                : `Are you sure you want to delete "${deleteDialog.productName}"? This action cannot be undone.`
          }
          confirmText="Delete"
          type="danger"
          loading={actionLoading}
        />

        {/* Notification Toast */}
        <NotificationToast
          message={notification.message}
          type={notification.type}
          isVisible={notification.isVisible}
          onClose={() => setNotification((prev) => ({ ...prev, isVisible: false }))}
        />
      </div>
    </>
  );
};

export default ProductManagement;
