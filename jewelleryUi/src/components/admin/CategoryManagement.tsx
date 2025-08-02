import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Upload, ImageIcon } from 'lucide-react';
import { Category } from '../../types';
import { apiService } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmDialog from '../common/ConfirmDialog';
import Dialog from '../common/Dialog';
import { ImageFile } from '../../types/index';
import { CategoryFormData } from '../../types/forms';
import { staticImageBaseUrl } from '../../constants/siteConfig';
import { categoryService } from '../../services/categoryService'; // Import the new service


const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<'handmade' | 'handloom'>('handmade'); // Controls the dropdown for category type
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Dialog states
  const [categoryDialog, setCategoryDialog] = useState<{
    isOpen: boolean;
    category: Category | null;
    mode: 'create' | 'edit';
  }>({
    isOpen: false,
    category: null,
    mode: 'create',
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    type: 'single' | 'bulk';
    categoryId?: string;
    categoryName?: string;
  }>({
    isOpen: false,
    type: 'single',
  });

  // Form states
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    image: '',
    sizeOptions: [],
    categoryType: 'handmade', // Initialize as a string
  });

  // New state for raw input value of size options
  const [inputValue, setInputValue] = useState('');

  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading,] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Effect to populate form data when opening dialog in edit mode
  useEffect(() => {
    if (categoryDialog.isOpen && categoryDialog.mode === 'edit' && categoryDialog.category) {
      const category = categoryDialog.category;
      setFormData({
        name: category.name,
        slug: category.slug,
        image: category.image,
        sizeOptions: category.sizeOptions || [],
        categoryType: category.categoryType || 'handmade', // Set as string, default to 'handmade'
      });
      // Set imageFiles for existing image
      if (category.image) {
        setImageFiles([
          {
            id: 'existing-image',
            file: new File([], category.image), // Create a dummy file object
            preview: `${staticImageBaseUrl}${category.image}`,
            uploaded: true,
            url: category.image,
          },
        ]);
      } else {
        setImageFiles([]);
      }
      // Set selectedType based on existing categoryType
      setSelectedType(category.categoryType || 'handmade'); // Set selectedType from category
      // Initialize inputValue for edit mode
      setInputValue(category.sizeOptions ? category.sizeOptions.join(', ') : '');
    } else if (categoryDialog.isOpen && categoryDialog.mode === 'create') {
      // Reset form data for create mode
      setFormData({
        name: '',
        slug: '',
        image: '',
        sizeOptions: [],
        categoryType: 'handmade', // Reset as string, default to 'handmade'
      });
      setImageFiles([]);
      setSelectedType('handmade');
      // Reset inputValue for create mode
      setInputValue('');
    }
  }, [categoryDialog]);

  // Function to load categories from API
  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCategories();
      setCategories(response || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      setMessage({ type: 'error', text: 'Failed to load categories.' });
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to generate a URL-friendly slug from a name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Handle input changes for form fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'name') {
      setFormData(prev => ({
        ...prev,
        name: value,
        slug: prev.slug || generateSlug(value),
        // No need to explicitly keep other fields here, spread operator handles it
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle change for category type dropdown
  const handleCategoryTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as 'handmade' | 'handloom';
    setSelectedType(type);
    setFormData(prev => ({
      ...prev,
      categoryType: type, // Directly set the string value
    }));
  };

  // Image handling functions for drag-and-drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle image drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  // Handle file input change
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  // Process selected image files
  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      // Only allow one image for categories
      const file = imageFiles[0];
      const newImageFile: ImageFile = {
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
        uploaded: false,
      };
      setImageFiles([newImageFile]);
    }
  };

  // Remove the currently selected image
  const removeImage = () => {
    setImageFiles([]);
    setFormData(prev => ({ ...prev, image: '' })); // Clear stored image URL
  };

  // Handle form submission (create/update category)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Category name is required.' });
      return;
    }

    try {
      setActionLoading(true);
      setMessage(null); // Clear previous messages

      // Use the refactored uploadCategoryImage from categoryService
      let uploadedImages = await categoryService.uploadImage(imageFiles, formData);
      let finalImageUrl = uploadedImages[0] || '';


      // Construct categoryData to send to API
      const categoryData: Omit<CategoryFormData, 'image'> & { image?: string } = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        image: finalImageUrl, // Use the uploaded URL
        sizeOptions: formData.sizeOptions,
        categoryType: formData.categoryType, // Directly use the string value
      };


      if (categoryDialog.mode === 'edit' && categoryDialog.category?.id) {
        await apiService.updateCategory(categoryDialog.category.id, categoryData);
        setMessage({ type: 'success', text: 'Category updated successfully!' });
      } else {
        await apiService.createCategory(categoryData);
        setMessage({ type: 'success', text: 'Category created successfully!' });
      }

      await loadCategories(); // Reload categories to show changes
      setCategoryDialog({ isOpen: false, category: null, mode: 'create' }); // Close dialog
    } catch (error) {
      console.error('Error saving category:', error);
      setMessage({ type: 'error', text: `Failed to save category: ${(error as Error).message}` });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle single category deletion
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      setActionLoading(true);
      setMessage(null);
      await apiService.deleteCategory(categoryId);
      await loadCategories();
      setDeleteDialog({ isOpen: false, type: 'single' });
      setMessage({ type: 'success', text: 'Category deleted successfully!' });
    } catch (error) {
      console.error('Error deleting category:', error);
      setMessage({ type: 'error', text: `Failed to delete category: ${(error as Error).message}` });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle bulk category deletion
  const handleBulkDelete = async () => {
    try {
      setActionLoading(true);
      setMessage(null);
      await Promise.all(selectedCategories.map(id => apiService.deleteCategory(id)));
      setSelectedCategories([]); // Clear selection after deletion
      await loadCategories();
      setDeleteDialog({ isOpen: false, type: 'bulk' });
      setMessage({ type: 'success', text: `${selectedCategories.length} categories deleted successfully!` });
    } catch (error) {
      console.error('Error bulk deleting categories:', error);
      setMessage({ type: 'error', text: `Failed to delete categories: ${(error as Error).message}` });
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle selection for all categories
  const handleSelectAll = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map(c => c.id!));
    }
  };

  // Render loading spinner while fetching initial data
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-4 sm:p-6 font-sans">
      {/* Message Display */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm font-medium mb-5 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          role="alert"
        >
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-5">
        <h2 className="text-2xl font-bold text-[#5f3c2c] text-center sm:text-left">
          Categories ({categories.length})
        </h2>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          {selectedCategories.length > 0 && (
            <button
              onClick={() => setDeleteDialog({ isOpen: true, type: 'bulk' })}
              className="w-full sm:w-auto bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center space-x-2 transition-colors duration-200"
              disabled={actionLoading}
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Selected ({selectedCategories.length})</span>
            </button>
          )}
          <button
            onClick={() => setCategoryDialog({ isOpen: true, category: null, mode: 'create' })}
            className="w-full sm:w-auto bg-[#d2b79f] text-[#4d2e1f] px-4 py-2 rounded-lg font-semibold hover:bg-[#f0dfcc] flex items-center justify-center space-x-2 transition-colors duration-200"
            disabled={actionLoading}
          >
            <Plus className="h-4 w-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#dec8b0]">
            <thead className="bg-[#f5e9dc]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5f3c2c] uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedCategories.length === categories.length && categories.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-[#d2b79f] text-[#5f3c2c] focus:ring-[#d2b79f]"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5f3c2c] uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5f3c2c] uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5f3c2c] uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5f3c2c] uppercase tracking-wider">
                  Category Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5f3c2c] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 italic">
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map(category => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id!)}
                        onChange={() => {
                          setSelectedCategories(prev =>
                            prev.includes(category.id!)
                              ? prev.filter(id => id !== category.id)
                              : [...prev, category.id!]
                          );
                        }}
                        className="rounded border-[#d2b79f] text-[#5f3c2c] focus:ring-[#d2b79f]"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {category.image ? (
                        <img
                          src={`${staticImageBaseUrl}${category.image}`}
                          alt={category.name}
                          className="h-12 w-12 object-cover rounded-md shadow-sm"
                          onError={(e) => {
                            e.currentTarget.src = 'https://placehold.co/100x100/CCCCCC/000000?text=No+Image';
                          }}
                        />
                      ) : (
                        <ImageIcon className="h-12 w-12 text-gray-300" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5f3c2c]">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5f3c2c]">
                      {category.slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5f3c2c]">
                      {category.categoryType || '-'} {/* Display directly */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            setCategoryDialog({
                              isOpen: true,
                              category,
                              mode: 'edit',
                            })
                          }
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            setDeleteDialog({
                              isOpen: true,
                              type: 'single',
                              categoryId: category.id!,
                              categoryName: category.name,
                            })
                          }
                          className="text-red-600 hover:underline font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Form Dialog */}
      <Dialog
        isOpen={categoryDialog.isOpen}
        onClose={() => setCategoryDialog({ isOpen: false, category: null, mode: 'create' })}
        title={categoryDialog.mode === 'edit' ? 'Edit Category' : 'Create Category'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category-name" className="block text-sm font-medium text-[#5f3c2c] mb-2">
                Category Name *
              </label>
              <input
                type="text"
                id="category-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-[#D4B896]"
                placeholder="Enter category name"
              />
            </div>

            <div>
              <label htmlFor="category-slug" className="block text-sm font-medium text-[#5f3c2c] mb-2">
                Slug
              </label>
              <input
                type="text"
                id="category-slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-[#D4B896]"
                placeholder="category-slug"
              />
            </div>
          </div>

          <div>
            <label htmlFor="category-type" className="block text-sm font-medium text-[#5f3c2c] mb-2">
              Category Type
            </label>
            <select
              id="category-type"
              value={selectedType}
              onChange={handleCategoryTypeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-[#D4B896]"
            >
              <option value="handmade">Handmade</option>
              <option value="handloom">Handloom</option>
            </select>
          </div>

          <div>
            <label htmlFor="size-options" className="block text-sm font-medium text-[#5f3c2c] mb-2">
              Size Options (comma separated)
            </label>
            <input
              type="text"
              id="size-options"
              placeholder="Enter sizes"
              value={inputValue} // Bind to inputValue
              onChange={e => {
                setInputValue(e.target.value); // Update raw input value
                const newSizeOptions = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                setFormData(prev => ({
                  ...prev,
                  sizeOptions: newSizeOptions,
                }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-[#D4B896]"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-[#5f3c2c] mb-2">
              Category Image
            </label>

            {/* Drag and Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200 ${dragActive
                ? 'border-[#D4B896] bg-[#F2E9D8]'
                : 'border-gray-300 hover:border-[#D4B896] hover:bg-gray-50'
                }`}
            >
              <Upload className="h-8 w-8 text-[#5f3c2c] mx-auto mb-2" />
              <p className="text-sm text-[#5f3c2c]">
                Drag and drop an image here, or <span className="text-[#D4B896] font-semibold">click to browse</span>
              </p>
              <p className="text-xs text-[#D4B896] mt-1">
                Supports: JPG, PNG, GIF (Max 5MB - mock limit)
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />

            {/* Image Preview */}
            {imageFiles.length > 0 && (
              <div className="mt-4 flex items-center space-x-4">
                <div className="relative inline-block">
                  <img
                    src={imageFiles[0].preview}
                    alt="Category preview"
                    className="w-32 h-32 object-cover rounded-lg shadow-md"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                    aria-label="Remove image"
                  >
                    <ImageIcon className="h-3 w-3" /> {/* Using ImageIcon for X mark */}
                  </button>
                  <div className="absolute top-1 left-1">
                    {imageFiles[0].uploaded ? (
                      <div className="w-3 h-3 bg-green-500 rounded-full" title="Uploaded" />
                    ) : (
                      <div className="w-3 h-3 bg-yellow-500 rounded-full" title="Pending upload" />
                    )}
                  </div>
                </div>
                {imageFiles[0].file && (
                  <span className="text-sm text-gray-600">
                    {imageFiles[0].file.name} ({(imageFiles[0].file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setCategoryDialog({ isOpen: false, category: null, mode: 'create' })}
              disabled={actionLoading || uploading}
              className="flex-1 px-4 py-2 text-[#5f3c2c] bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading || uploading}
              className="flex-1 px-4 py-2 bg-[#D4B896] text-rich-brown rounded-lg hover:bg-[#B79B7D] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors duration-200"
            >
              {(actionLoading || uploading) ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{uploading ? 'Uploading...' : 'Saving...'}</span>
                </>
              ) : (
                <span>{categoryDialog.mode === 'edit' ? 'Update Category' : 'Create Category'}</span>
              )}
            </button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, type: 'single' })}
        onConfirm={
          deleteDialog.type === 'single'
            ? () => handleDeleteCategory(deleteDialog.categoryId!)
            : handleBulkDelete
        }
        title={deleteDialog.type === 'single' ? 'Delete Category' : 'Delete Categories'}
        message={
          deleteDialog.type === 'single'
            ? `Are you sure you want to delete "${deleteDialog.categoryName}"? This action cannot be undone.`
            : `Are you sure you want to delete ${selectedCategories.length} selected categories? This action cannot be undone.`
        }
        confirmText="Delete"
        type="danger"
        loading={actionLoading}
      />
    </div>
  );
};

export default CategoryManagement;
