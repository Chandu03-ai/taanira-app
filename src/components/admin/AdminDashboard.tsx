import React from 'react';
import { Package, ShoppingCart, DollarSign, Users } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { SITE_CONFIG, staticImageBaseUrl } from '../../constants/siteConfig';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import Card from './dashboard/Card';


const AdminDashboard: React.FC = () => {
  const { stats, recentProducts, loading, error } = useAdminDashboard();

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600 p-4">Error: {error}</div>;
  if (!stats) return <div className="text-gray-600 p-4">No data available</div>;

  return (
    <div className="space-y-6 mt-0 px-3 sm:px-4 md:px-6 lg:px-8 font-serif">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="card-elegant">
          <Card icon={Package} title="Total Products" value={stats.products.total} note={`${stats.products.inStock} in stock`} />
        </div>
        <div className="card-elegant">
          <Card icon={ShoppingCart} title="Total Orders" value={stats.orders.total} note={`${stats.orders.pending} pending • ${stats.orders.completed} completed`} />
        </div>
        <div className="card-elegant">
          <Card icon={DollarSign} title="Revenue" value={`${SITE_CONFIG.currencySymbol}${stats.orders.revenue.toLocaleString()}`} note="Total earnings" />
        </div>
        <div className="card-elegant">
          <Card icon={Users} title="Total Users" value={stats.users.total} note="Registered users" />
        </div>
      </div>

      {/* Categories Overview */}
      <div className="card-elegant">
        <h3 className="text-base sm:text-lg font-serif font-semibold italic mb-3 sm:mb-4 text-rich-brown">Categories Overview</h3>
        {Object.keys(stats.products.categories).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
            {Object.keys(stats.products.categories).map(cat => (
              <div key={cat} className="bg-subtle-beige rounded-xl p-3 sm:p-4 text-center text-xs sm:text-sm capitalize text-rich-brown font-serif font-semibold italic shadow-sm">
                {cat}
                <div className="text-xs text-mocha/70 mt-1 font-serif font-light">
                  {stats.products.categories[cat]} items
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs sm:text-sm text-mocha/70 font-serif italic">No category data available.</div>
        )}
      </div>

      {/* Recent Products */}
      <div className="card-elegant">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-subtle-beige flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-serif font-semibold italic text-rich-brown">Recent Products</h2>
          <span className="text-xs sm:text-sm text-mocha/70 font-serif italic">{recentProducts.length} items</span>
        </div>

        {/* Table */}
        <div className="relative overflow-auto max-h-[400px]">
          <table className="min-w-full table-fixed divide-y divide-subtle-beige">
            {/* Table Head */}
            <thead className="bg-subtle-beige sticky top-0 z-10 text-rich-brown text-xs sm:text-sm uppercase font-serif">
              <tr>
                <th className="w-[40%] px-4 py-3 text-left font-semibold italic tracking-wider">Product</th>
                <th className="w-[20%] px-4 py-3 text-left font-semibold italic tracking-wider hidden md:table-cell">Category</th>
                <th className="w-[20%] px-4 py-3 text-left font-semibold italic tracking-wider">Price</th>
                <th className="w-[20%] px-4 py-3 text-left font-semibold italic tracking-wider">Stock</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="bg-white divide-y divide-subtle-beige text-sm font-serif">
              {recentProducts.map((p) => (
                <tr key={p.id} className="hover:bg-subtle-beige/30 transition-all duration-200 ease-in-out">
                  {/* Product Column */}
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center space-x-3">
                      <img
                        src={p.images?.[0]?.startsWith('http') ? p.images[0] : `${staticImageBaseUrl}${p.images[0]}`}
                        alt={p.name}
                        className="h-10 w-10 rounded-xl object-cover flex-shrink-0 shadow-sm"
                      />
                      <div className="min-w-0">
                        <p className="text-rich-brown font-semibold italic line-clamp-2">{p.name}</p>
                        <p className="md:hidden text-xs text-mocha/70 font-light">{p.category}</p>
                      </div>
                    </div>
                  </td>

                  {/* Category (hidden in mobile) */}
                  <td className="hidden md:table-cell px-4 py-3 align-middle text-rich-brown font-light italic">{p.category}</td>

                  {/* Price */}
                  <td className="px-4 py-3 align-middle font-semibold text-gray-900">
                    {SITE_CONFIG.currencySymbol}{p.price?.toLocaleString()}
                  </td>

                  {/* Stock */}
                  <td className="px-4 py-3 align-middle">
                    <span className={`px-3 py-1 rounded-xl text-xs font-serif font-semibold italic ${p.stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {p.stock ? 'In Stock' : 'Out'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};




export default AdminDashboard;