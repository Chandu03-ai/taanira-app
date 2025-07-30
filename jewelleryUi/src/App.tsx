import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import ProtectedRoute from './components/common/ProtectedRoute';
import RouteGuard from './components/common/RouteGuard';
import NotificationToast from './components/common/NotificationToast';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import SitemapPage from './pages/SitemapPage';
import NotFoundPage from './pages/NotFoundPage';
import Footer from './components/common/Footer';

function AppContent() {
  const location = useLocation();
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const hideFooterRoutes = ['/login', '/register', '/admin'];
  const hideHeaderRoutes = ['/']; 

  const shouldShowFooter = !hideFooterRoutes.some(path => location.pathname.startsWith(path));
  const shouldShowHeader = !hideHeaderRoutes.includes(location.pathname); 

  return (
    <RouteGuard>
      <div className="min-h-screen bg-theme-background flex flex-col">
        {shouldShowHeader && <Header />}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/sitemap" element={<SitemapPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />

            {/* Protected Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/orders"
              element={
                <ProtectedRoute allowedRoles={['User']}>
                  <UserOrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/addresses"
              element={
                <ProtectedRoute allowedRoles={['User']}>
                  <AddressManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        {shouldShowFooter && <Footer />}

        <NotificationToast />
      </div>
    </RouteGuard>
  );
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <AppContent />
      </Router>
    </HelmetProvider>
  );
}

export default App;