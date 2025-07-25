import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/common/Header';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CategoryPage from './pages/CategoryPage';
import CartPage from './pages/CartPage';
import UserProfile from './components/user/UserProfile';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import UserOrdersPage from './pages/UserOrdersPage';
import { useAuthStore } from './store/authStore';
import AddressManagementPage from './pages/AddressManagementPage';

function App() {
  const { isAuthenticated, user, initialize } = useAuthStore();

  useEffect(() => {
    // Initialize auth state on app load
    initialize();
  }, [initialize]);

  return (
    <HelmetProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/product/:slug" element={<ProductDetailPage />} />
              <Route path="/category/:category" element={<CategoryPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/user/orders" element={<UserOrdersPage />} />
              <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/addresses" element={<AddressManagementPage />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
              
              {/* Protected Admin Route */}
              {isAuthenticated && user?.role === 'Admin' && (
                <Route path="/admin" element={<AdminPage />} />
              )}
              
              {/* Fallback for unknown routes */}
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;