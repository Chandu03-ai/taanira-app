import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Package,
  Users,
  ShoppingCart,
  FileText,
  Menu,
  X,
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AdminDashboard from '../components/admin/AdminDashboard';
import ProductManagement from '../components/admin/ProductManagement';
import SEOHead from '../components/seo/SEOHead';
import { SITE_CONFIG } from '../constants/siteConfig';
import OrderManagement from '../components/admin/OrderManagement';
import UserManagement from '../components/admin/UserManagement';
import CategoryManagement from '../components/admin/CategoryManagement';
import UserMenu from '../components/common/UserMenu';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const baseFocusClasses = "focus:outline-none focus:ring-0";

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: FileText },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'users', label: 'Users', icon: Users },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <SEOHead
        title={`Admin Dashboard - ${SITE_CONFIG.name}`}
        description="Manage your jewelry store inventory, orders, and settings"
      />

      {/* Main Layout */}
      <div className="min-h-screen bg-theme-background text-theme-primary font-serif pt-0">
        <div className="flex h-screen">
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-theme-primary/80 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside className={`
            fixed lg:static inset-y-0 left-0 z-50 w-64 lg:w-64 xl:w-72 
            bg-theme-light border-r border-theme-surface shadow-xl lg:shadow-none
            transform transition-all duration-200 ease-in-out lg:transform-none
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            flex flex-col h-screen
          `}>
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-theme-secondary scrollbar-track-transparent">
              <div className="p-4 lg:p-6">
                {/* Mobile Close Button */}
                <div className="flex items-center justify-between mb-4 lg:hidden">
                  <h1 className="text-lg font-serif font-semibold italic text-theme-primary">Admin Panel</h1>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className={`p-2 rounded-xl hover:bg-theme-surface transition-all duration-200 ease-in-out ${baseFocusClasses}`}
                    title="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <h1 className="hidden lg:block text-lg xl:text-xl font-serif font-semibold italic text-theme-primary mb-4 lg:mb-6">Admin Panel</h1>

                <nav>
                  <div className="space-y-1 lg:space-y-2">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center px-3 lg:px-4 py-2.5 lg:py-3 text-left hover:bg-theme-accent/30 rounded-xl transition-all duration-200 ease-in-out ${baseFocusClasses} ${
                          activeTab === tab.id
                            ? 'bg-theme-accent text-theme-primary shadow-sm'
                            : 'text-theme-primary'
                        }`}
                        title={tab.label}
                      >
                        <tab.icon className="h-4 w-4 lg:h-5 lg:w-5 mr-2 lg:mr-3 flex-shrink-0" />
                        <span className="text-sm font-serif font-semibold italic truncate">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </nav>
              </div>
            </div>

            <div className="p-3 lg:p-4 border-t border-theme-surface bg-theme-surface/50">
              <UserMenu dropdownPosition="top" />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-theme-background">
            {/* Mobile Header */}
            <div className="lg:hidden bg-theme-light border-b border-theme-surface p-3 sm:p-4 flex items-center justify-between sticky top-0 z-30">
              <button
                onClick={() => setSidebarOpen(true)}
                className={`p-2 rounded-xl hover:bg-theme-surface transition-all duration-200 ease-in-out ${baseFocusClasses}`}
                title="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-base sm:text-lg font-serif font-semibold italic text-theme-primary truncate mx-4">
                {tabs.find(tab => tab.id === activeTab)?.label}
              </h1>
              <div className="w-9 flex-shrink-0" /> {/* Spacer for centering */}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 scrollbar-thin scrollbar-thumb-theme-secondary scrollbar-track-transparent">
              {activeTab === 'dashboard' && <AdminDashboard />}
              {activeTab === 'products' && <ProductManagement />}
              {activeTab === 'categories' && <CategoryManagement />}
              {activeTab === 'orders' && <OrderManagement />}
              {activeTab === 'users' && <UserManagement />}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminPage;