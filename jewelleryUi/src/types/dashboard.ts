export interface DashboardStats {
  products: {
    total: number;
    inStock: number;
    categories: Record<string, number>;
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
    revenue: number;
  };
  users: {
    total: number;
  };
}

export interface ProductStats {
  totalProducts: number;
  stock: number;
  categories: Record<string, number>;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

export interface UserStats {
  total: number;
  admins: number;
  users: number;
  active: number;
  inactive: number;
}