import { Category, Product } from ".";

export interface ProductDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: Partial<Product>) => void;
    product: Product | null;
    categories: Category[];
    loading?: boolean;
    mode?: 'add' | 'edit';
    uploadProductImage?: (file: File) => Promise<string | null>;
}