import { AddressFormData } from "./address";
import { Review } from "./review";

export interface User {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  contact: string;
  username: string;
  role?: 'Admin' | 'User';
  avatar?: string;
  latestOrderId?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  firstname: string;
  lastname: string;
  contact: string;
  username: string;
  password: string;
}

export interface Product {
  updatedAt: string | number | Date;
  image: string | undefined;
  isNew: boolean;
  isSoldOut: any;
  hoverImage: string | undefined;
  id: string;
  name: string;
  slug?: string; // SEO-friendly URL
  category: string; // slug or ObjectId reference
  description?: string;
  initialPrice: number; // what admin paid
  price: number; // selling price to customer
  comparePrice?: number; // optional MRP
  images: string[];
  stock: boolean;
  createdAt: string;
  details:string;
  reviews?: Review[];
  averageRating?: number;
  reviewCount?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  sizeOptions?: string[];
  categoryType: 'handmade' | 'handloom'; 
}




export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  selectedSize?: string;
  product: Product;
}
export interface GuestCartItem {
  id:string,
  productId: string;
  quantity: number;
  selectedSize?: string;
  product: Product;
}
export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  image: string;
  description?: string; // Added description property
}

export interface Order {
  id: string; // Razorpay order ID
  amount: number; // Total amount in paisa
  amount_due: number;
  amount_paid: number;
  attempts: number;
  currency: string;
  entity: string; // Always "order"
  status: 'created' | 'attempted' | 'paid';
  notes: {
    itemCount: string;
    userEmail: string;
    userId: string;
  };
  receipt: string;
  offer_id: string | null;
  createdAt: string; // Unix timestamp (in seconds)
  items: OrderItem[];
  trackingNumber:string | null;
  shippingAddress: AddressFormData;
}


export interface OrderItemRequest {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image: string;
}

export interface OrderRequest {
  amount: number; // In paise (i.e., smallest currency unit)
  currency: 'INR'; // Could be generalized if needed
  receipt?: string;
  items: OrderItem[]; 
  shippingAddress: AddressFormData; // Define this below
  notes?: {
    userId: string;
    userEmail: string;
    itemCount: string;
    [key: string]: string; // Allow additional note fields
  };
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  status: string;
}

export interface PaymentVerificationPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface ProductFilters {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  q?: string; // Search query
  sort?: string;
  page?: number;
  limit?: number;
}

export interface ProductImport {
  name: string;
  slug?: string;
  category: string;
  description?: string;
  initialPrice: number;
  price: number;
  comparePrice?: number;
  images?: string[];
  stock?: boolean;
  id?: string; // Allow id for update operations
}


export interface ImageFile {
    id: string;
    file: File;
    preview: string;
    uploaded?: boolean;
    url?: string;
}