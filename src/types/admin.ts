export interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  isVisible: boolean;
}

export interface TrackingResponse {
  orderid: string;
  trackId: string;
  delivered: boolean;
}

export interface DeleteDialogState {
  isOpen: boolean;
  type: 'category' | 'product' | 'bulk';
  item: any | null;
  productId?: string;
  productName?: string;
}

export interface EditDialogState {
  isOpen: boolean;
  product: any | null;
}

export interface CategoryDialogState {
  isOpen: boolean;
  category: any | null;
  mode: 'create' | 'edit';
}

export interface RoleChangeDialog {
  isOpen: boolean;
  userId?: string;
  newRole?: string;
}

export interface TrackingConfirmDialog {
  isOpen: boolean;
  userId?: string;
  orderId?: string;
}