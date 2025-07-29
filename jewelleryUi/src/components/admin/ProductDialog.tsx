import React, { useState, useEffect, useRef } from 'react';
import Dialog from '../common/Dialog';
import { Upload, X, Move, Eye } from 'lucide-react';
import { staticImageBaseUrl } from '../../constants/siteConfig';
import { categoryService } from '../../services';
import { ProductFormData } from '../../types/forms';
import { ImageFile } from '../../types';
import { ProductDialogProps } from '../../types/dialog';

const ProductDialog: React.FC<ProductDialogProps> = ({
    isOpen,
    onClose,
    onSave,
    product,
    categories,
    loading = false,
    mode = 'edit',
}) => {
    const [imageFiles, setImageFiles] = useState<ImageFile[]>([])
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragRef = useRef<HTMLDivElement>(null);


    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        slug: '',
        category: '',
        description: '',
        details: '',
        initialPrice: 0,
        price: 0,
        comparePrice: 0,
        images: [],
        stock: true,
    });

    useEffect(() => {
        if (isOpen) {
            if (mode === 'add') {
                // Reset form for add mode
                setFormData({
                    name: '',
                    slug: '',
                    category: '',
                    description: '',
                    details: '',
                    initialPrice: 0,
                    price: 0,
                    comparePrice: 0,
                    images: [],
                    stock: true,
                });
                setImageFiles([]);
            }
        }
    }, [isOpen, mode]);

    useEffect(() => {
        if (product && mode === 'edit' && categories.length > 0) {

            setFormData({
                name: product.name || '',
                slug: product.slug || '',
                category: (() => {
                    if (typeof product.category === 'string') {
                        const match = categories.find(cat => cat.name === product.category);
                        return match?.id || '';
                    } else {
                        return (product.category as any)?.id || '';
                    }
                })(),

                description: product.description || '',
                initialPrice: product.initialPrice || 0,
                details:product.details || '',
                price: product.price || 0,
                comparePrice: product.comparePrice || 0,
                images: product.images || [],
                stock: product.stock ?? true,
            });

            const existingImages: ImageFile[] = (product.images || []).map((url, index) => ({
                id: `existing-${index}`,
                file: null as any,
                preview: url.startsWith('http') ? url : `${staticImageBaseUrl}/${url}`,
                uploaded: true,
                url: url,
            }));
            setImageFiles(existingImages);
        }
    }, [product, mode, categories]);


    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        handleFiles(files);
    };

    const handleFiles = (files: File[]) => {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        const newImageFiles: ImageFile[] = imageFiles.map(file => ({
            id: `${Date.now()}-${Math.random()}`,
            file,
            preview: URL.createObjectURL(file),
            uploaded: false
        }));

        setImageFiles(prev => [...prev, ...newImageFiles]);
    };

    const removeImage = (id: string) => {
        setImageFiles(prev => {
            const removed = prev.find(img => img.id === id);
            const updated = prev.filter(img => img.id !== id);

            // If removed image was already uploaded, update formData.images too
            if (removed?.uploaded && removed.url) {
                setFormData(form => ({
                    ...form,
                    images: form.images.filter(url => url !== removed.url),
                }));
            }

            if (removed && !removed.uploaded) {
                URL.revokeObjectURL(removed.preview);
            }

            return updated;
        });
    };


    const reorderImages = (fromIndex: number, toIndex: number) => {
        setImageFiles(prev => {
            const updated = [...prev];
            const [removed] = updated.splice(fromIndex, 1);
            updated.splice(toIndex, 0, removed);
            return updated;
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...(prev[parent as keyof ProductFormData] as any),
                    [child]: type === 'number' ? parseFloat(value) || 0 : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'number' ? parseFloat(value) || 0 : value
            }));
        }
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setFormData(prev => ({
            ...prev,
            name,
            slug: prev.slug || generateSlug(name),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name?.trim()) {
            alert('Product name is required');
            return;
        }

        if (!formData.category?.trim()) {
            alert('Product category is required');
            return;
        }

        try {
            setUploading(true);

            const newImageFiles = imageFiles.filter(img => !img.uploaded && img.file);

            const formPayload = {
                existingImageUrls: formData.images,
            };


            const uploadedImageUrls = await categoryService.uploadImage(newImageFiles, formPayload);

            const finalImageUrls = [
                ...formData.images.filter(url => !newImageFiles.some(f => f.url === url)),
                ...uploadedImageUrls,
            ];


            const productData = {
                ...(mode === 'edit' && product?.id ? { id: product.id } : {}),
                name: formData.name,
                slug: formData.slug || generateSlug(formData.name),
                category: formData.category,
                description: formData.description,
                initialPrice: formData.initialPrice,
                price: formData.price,
                comparePrice: formData.comparePrice,
                images: finalImageUrls,
                stock: formData.stock,
            };

            onSave(productData);
            onClose()
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Failed to save product. Please try again.');
        } finally {
            setUploading(false);
        }
    };


    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'add' ? 'Add New Product' : 'Edit Product'}
            maxWidth="2xl"
        >
            <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
                {/* Scrollable Form Body */}
                <div className="overflow-y-auto space-y-6 pr-2">

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Product Name */}
                        <div>
                            <label className="block text-sm font-medium text-[#5f3c2c] mb-2">
                                Product Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Enter product name"
                                value={formData.name}
                                onChange={handleNameChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4B896] focus:border-transparent"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-[#5f3c2c] mb-2">
                                Category *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4B896] focus:border-transparent"
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                        {cat.sizeOptions && cat.sizeOptions.length > 0 && ` (Has sizes: ${cat.sizeOptions.join(', ')})`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Initial Price */}
                        <div>
                            <label className="block text-sm font-medium text-[#5f3c2c] mb-2">
                                Initial Price (Cost) *
                            </label>
                            <input
                                type="number"
                                name="initialPrice"
                                value={formData.initialPrice || ''}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4B896] focus:border-transparent"
                            />
                        </div>

                        {/* Selling Price */}
                        <div>
                            <label className="block text-sm font-medium text-[#5f3c2c] mb-2">
                                Selling Price *
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price || ''}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4B896] focus:border-transparent"
                            />
                        </div>

                        {/* Compare Price */}
                        <div>
                            <label className="block text-sm font-medium text-[#5f3c2c] mb-2">
                                Compare Price
                            </label>
                            <input
                                type="number"
                                name="comparePrice"
                                value={formData.comparePrice || ''}
                                onChange={handleInputChange}
                                placeholder="Original price"
                                min="0"
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4B896] focus:border-transparent"
                            />
                        </div>

                        {/* Slug */}
                        <div>
                            <label className="block text-sm font-medium text-[#5f3c2c] mb-2">
                                Slug
                            </label>
                            <input
                                type="text"
                                name="slug"
                                value={formData.slug}
                                onChange={handleInputChange}
                                placeholder="product-slug"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4B896] focus:border-transparent"
                            />
                        </div>

                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-[#5f3c2c] mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={3}
                            placeholder="Product description..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4B896] focus:border-transparent"
                        />
                    </div>
                    {/* Details */}
                    <div>
                        <label className="block text-sm font-medium text-[#5f3c2c] mb-2">
                            Details
                        </label>
                        <textarea
                            name="details"
                            value={formData.details}
                            onChange={handleInputChange}
                            rows={4}
                            placeholder="E.g., purity 92.5 silver, handcrafted with pure zari, made of cotton-silk blend"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4B896] focus:border-transparent"
                        />
                    </div>


                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-[#5f3c2c] mb-2">
                            Product Images
                        </label>

                        {/* Drag and Drop Area */}
                        <div
                            ref={dragRef}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${dragActive
                                ? 'border-[#D4B896] bg-[#F2E9D8]'
                                : 'border-gray-300 hover:border-[#D4B896] hover:bg-gray-50'
                                }`}
                        >
                            <Upload className="h-8 w-8 text-[#5f3c2c] mx-auto mb-2" />
                            <p className="text-sm text-[#5f3c2c]">
                                Drag and drop images here, or <span className="text-[#D4B896]">click to browse</span>
                            </p>
                            <p className="text-xs text-[#D4B896] mt-1">
                                Supports: JPG, PNG, GIF (Max 5MB each)
                            </p>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileInput}
                            className="hidden"
                        />

                        {/* Image Previews */}
                        {imageFiles.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                {imageFiles.map((imageFile, index) => (
                                    <div key={imageFile.id} className="relative group">
                                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                            <img
                                                src={imageFile.preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Image Controls */}
                                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => reorderImages(index, index - 1)}
                                                    className="p-1 bg-white rounded-full hover:bg-gray-100"
                                                    title="Move left"
                                                >
                                                    <Move className="h-3 w-3 rotate-180" />
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => window.open(imageFile.preview, '_blank')}
                                                className="p-1 bg-white rounded-full hover:bg-gray-100"
                                                title="Preview"
                                            >
                                                <Eye className="h-3 w-3" />
                                            </button>

                                            {index < imageFiles.length - 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => reorderImages(index, index + 1)}
                                                    className="p-1 bg-white rounded-full hover:bg-gray-100"
                                                    title="Move right"
                                                >
                                                    <Move className="h-3 w-3" />
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => removeImage(imageFile.id)}
                                                className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                title="Remove"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>

                                        {/* Upload Status */}
                                        <div className="absolute top-1 left-1">
                                            {imageFile.uploaded ? (
                                                <div className="w-2 h-2 bg-green-500 rounded-full" title="Uploaded" />
                                            ) : (
                                                <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Pending upload" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Toggle Stock */}
                    <div className="grid grid-cols-1 gap-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="stock"
                                checked={formData.stock}
                                onChange={handleCheckboxChange}
                                className="rounded border-gray-300 text-[#D4B896] focus:ring-[#D4B896]"
                            />
                            <span className="text-sm text-[#5f3c2c]">In Stock</span>
                        </label>
                    </div>
                </div>

                {/* Action Buttons Footer (fixed) */}
                <div className="flex space-x-3 pt-4 border-t mt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading || uploading}
                        className="flex-1 px-4 py-2 text-[#5f3c2c] bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="flex-1 px-4 py-2 bg-[#D4B896] text-rich-brown rounded-lg hover:bg-[#B79B7D] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        {uploading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Uploading...</span>
                            </>
                        ) : (
                            <span>{mode === 'add' ? 'Create Product' : 'Save Changes'}</span>
                        )}
                    </button>
                </div>
            </form>

        </Dialog>

    );
};

export default ProductDialog;