import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  GridOptions,
  ModuleRegistry
} from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { CsvExportModule } from 'ag-grid-community';
import {
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  Search,
  RefreshCw,
  FileDown,
  Calendar,
  MapPin,
  Send,
  Pencil,
  Copy, // Added Copy icon
  Check // Added Check icon
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { SITE_CONFIG, staticImageBaseUrl } from '../../constants/siteConfig';
import { Order, OrderItem } from '../../types';
import { adminService } from '../../services';
import { formatReadableDate } from '../../utils/dateUtils';
import { OrderStats } from '../../types/dashboard';
import Card from './dashboard/Card';

// Register AG Grid modules
ModuleRegistry.registerModules([ClientSideRowModelModule, CsvExportModule]);

// Custom cell renderers with beautiful styling
const StatusCellRenderer = (params: any) => {
  const status = params.value;
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'paid':
        return {
          icon: CheckCircle,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-800'
        };
      case 'created':
        return {
          icon: Clock,
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-800'
        };
      case 'attempted':
        return {
          icon: Package,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800'
        };
      default:
        return {
          icon: XCircle,
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${config.bg} ${config.border} ${config.text} shadow-sm`}>
      <Icon className={`h-3 w-3 mr-1.5 ${config.color}`} />
      <span className="capitalize font-medium">{status}</span>
    </div>
  );
};

const OrderIdCellRenderer = (params: any) => {
  const order = params.data;
  return (
    <div className="flex items-center space-x-2">
      <div>
        <div className="font-semibold text-gray-900 text-sm">{params.value}</div>
        {order.orderId && order.orderId !== order.id && (
          <div className="text-xs text-gray-500 font-mono">
            RZP: {order.orderId.slice(-8)}
          </div>
        )}
        {order.secondOrderId && order.isHalfPaid && (
          <div className="text-xs text-blue-600 font-mono">
            2nd: {order.secondOrderId.slice(-8)}
          </div>
        )}
      </div>
    </div>
  );
};

const CustomerCellRenderer = (params: any) => {
  const userId = params.data.notes?.userId || 'Unknown';
  const userEmail = params.data.notes?.userEmail || '';

  return (
    <div className="flex items-center space-x-3">
      <div className="min-w-0 flex-1">
        <div className="font-medium text-gray-900 text-sm truncate">{userId}</div>
        {userEmail && (
          <div className="text-xs text-gray-500 truncate">{userEmail}</div>
        )}
      </div>
    </div>
  );
};

const OrderItemsCellRenderer = (params: any) => {
  const items = params.value || [];
  const totalItems = items.length;
  const orderData = params.data;

  // Access context from gridOptions
  const onViewOrder = params.context?.onViewOrder;

  return (
    <div className="flex items-center justify-center gap-2">
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
        {totalItems} {totalItems === 1 ? 'item' : 'items'}
      </span>
      {onViewOrder && (
        <button
          onClick={() => onViewOrder(orderData)}
          className="p-1 rounded-full bg-gray-100 hover:bg-indigo-100 text-gray-500 hover:text-[#8f6c43] transition-all duration-200"
          title="View Order"
        >
          <Eye className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};



const AmountCellRenderer = (params: any) => {
  const amount = params.value ?? 0;

  return (
    <div className="text-right">
      <div className="text-lg font-bold text-gray-900">
        {`${SITE_CONFIG.currencySymbol}${(amount / 100).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`}
      </div>
      <div className="text-xs text-gray-500">Total Amount</div>
    </div>
  );
};


const DateCellRenderer = (params: any) => {
  const date = formatReadableDate(params.value);

  return (
    <div className="flex items-center space-x-2">
      <Calendar className="h-4 w-4 text-gray-400" />
      <div>
        <div className="text-sm font-medium text-gray-900">{date.split(' ')[0]}</div>
        <div className="text-xs text-gray-500">{date.split(' ').slice(1).join(' ')}</div>
      </div>
    </div>
  );
};

const AddressCellRenderer = (params: any) => {
  const address = params.value;
  if (!address) return <span className="text-gray-400 text-sm">No address</span>;

  return (
    <div className="py-2">
      <div className="flex items-start space-x-2">
        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="font-medium text-gray-900 text-sm">{address.fullName}</div>
          <div className="text-xs text-gray-600 space-y-0.5 mt-1">
            <div className="truncate">{address.houseNumber}, {address.streetArea}</div>
            {address.landmark && <div className="truncate">Near {address.landmark}</div>}
            <div className="truncate">{address.city}, {address.state} - {address.pincode}</div>
            <div className="flex items-center text-gray-500 mt-1">
              <span className="text-xs">📞 {address.mobileNumber}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActionsCellRenderer = (params: any) => {
  const order = params.data;
  const [trackingId, setTrackingId] = useState(order.trackingNumber || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [sendingRemaining, setSendingRemaining] = useState(false);

  // Sync tracking number if order changes
  useEffect(() => {
    setTrackingId(order?.trackingNumber || '');
    setIsEditing(false);
  }, [order?.trackingNumber]);

  const handleTrackIdSubmit = async () => {
    if (!trackingId.trim()) return;
    setIsSubmitting(true);
    try {
      await adminService.sendTrackingId(trackingId, order.id);
      
      // If this is a half payment order, enable remaining payment
      if (order.isHalfPaid && order.halfPaymentStatus === 'pending') {
        await adminService.enableRemainingPayment(order.id);
      }
      
      setIsSubmitted(true);
      setIsEditing(false);
      setTimeout(() => setIsSubmitted(false), 3000);
      
      // Refresh the grid data to show updated tracking info
      if (params.api) {
        params.api.refreshCells({ force: true });
      }
    } catch (error) {
      console.error('Failed to update tracking ID', error);
      alert('Failed to send tracking ID. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendRemainingPaymentLink = async () => {
    setSendingRemaining(true);
    try {
      // Enable remaining payment for this order
      await adminService.enableRemainingPayment(order.id);
      alert('Remaining payment enabled successfully! Customer can now complete payment.');
      
      // Refresh the grid data
      if (params.api) {
        params.api.refreshCells({ force: true });
      }
    } catch (error) {
      console.error('Failed to send remaining payment notification:', error);
      alert('Failed to send notification');
    } finally {
      setSendingRemaining(false);
    }
  };
  return (
    <div className="py-2 space-y-2">
      {order.status === 'paid' && (
        <div className="flex flex-col items-center justify-center space-y-3">
          {!isEditing && trackingId ? (
            // ✅ Tick with Edit
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-800">{trackingId}</span>
              <button
                onClick={() => setIsEditing(true)}
                className="text-[#a58f76] hover:text-[#8f6c43] text-xs flex items-center space-x-1"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            // Input + Send
            <>
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="Enter tracking ID"
                className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                disabled={isSubmitting}
              />

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleTrackIdSubmit}
                  disabled={!trackingId.trim() || isSubmitting}
                  className="flex items-center space-x-1 bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                >
                  <Send className="h-3 w-3" />
                  <span>{isSubmitting ? 'Sending...' : 'Send'}</span>
                </button>

                {isSubmitted && (
                  <div className="flex items-center space-x-1 text-emerald-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-xs font-medium">Sent!</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Half Payment Remaining Button */}
      {order.isHalfPaid && order.halfPaymentStatus === 'pending' && order.trackingNumber && !order.enableRemainingPayment && (
        <div className="flex justify-center">
          <button
            onClick={handleSendRemainingPaymentLink}
            disabled={sendingRemaining}
            className="flex items-center space-x-1 bg-yellow-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            <Send className="h-3 w-3" />
            <span>{sendingRemaining ? 'Enabling...' : 'Enable Remaining Payment'}</span>
          </button>
        </div>
      )}
      
      {/* Show status when remaining payment is enabled */}
      {order.isHalfPaid && order.halfPaymentStatus === 'pending' && order.enableRemainingPayment && order.secondOrderId && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-1 bg-green-100 text-green-800 text-xs px-3 py-1.5 rounded-lg font-medium">
            <CheckCircle className="h-3 w-3" />
            <span>Remaining Payment Enabled</span>
          </div>
        </div>
      )}
    </div>
  );
};



const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [quickFilterText, setQuickFilterText] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const gridRef = useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes] = await Promise.all([
        adminService.getOrderStats(),
        adminService.getAllOrders()
      ]);
      setStats(statsRes.result);
      setOrders(ordersRes.result || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadOrders();
    setIsRefreshing(false);
  };

  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
  }, []);

  const onViewOrder = useCallback((order: Order) => {
    setSelectedOrder(order);
  }, []);

  const onExportCsv = useCallback(() => {
    if (gridApi) {
      gridApi.exportDataAsCsv({
        fileName: `orders-${new Date().toISOString().split('T')[0]}.csv`,
        columnSeparator: ',',
      });
    }
  }, [gridApi]);

  const columnDefs: ColDef[] = useMemo(() => [
    {
      headerName: 'Order',
      field: 'id',
      width: 200,
      pinned: 'left',
      cellRenderer: OrderIdCellRenderer,
      filter: 'agTextColumnFilter',
      sortable: true,
    },
    {
      headerName: 'Customer',
      field: 'notes.userId',
      width: 200,
      cellRenderer: CustomerCellRenderer,
      filter: 'agTextColumnFilter',
      sortable: true,
    },
    {
      headerName: 'Items',
      field: 'items',
      width: 120,
      cellRenderer: OrderItemsCellRenderer,
      sortable: false,
      filter: false,
    },
    {
      headerName: 'Amount',
      field: 'amount',
      width: 140,
      cellRenderer: AmountCellRenderer,
      filter: 'agNumberColumnFilter',
      sortable: true,
      type: 'numericColumn',
    },
    {
      headerName: 'Status',
      field: 'status',
      width: 140,
      cellRenderer: StatusCellRenderer,
      filter: 'agSetColumnFilter',
      sortable: true,
    },
    {
      headerName: 'Payment Type',
      field: 'isHalfPaid',
      width: 120,
      cellRenderer: (params: any) => {
        const isHalf = params.value;
        const halfStatus = params.data.halfPaymentStatus;
        const hasSecondOrder = params.data.secondOrderId;
        
        if (!isHalf) {
          return <span className="text-xs text-gray-500">Full Payment</span>;
        }
        
        return (
          <div className="text-center">
            <div className="text-xs font-medium text-blue-600">Half Payment</div>
            <div className={`text-xs ${halfStatus === 'pending' ? 'text-yellow-600' : 'text-green-600'}`}>
              {halfStatus === 'pending' ? 'Remaining Due' : 'Completed'}
            </div>
            {hasSecondOrder && (
              <div className="text-xs text-gray-500">2nd Order Ready</div>
            )}
          </div>
        );
      },
      filter: 'agSetColumnFilter',
      sortable: true,
    },
    {
      headerName: 'Date',
      field: 'createdAt',
      width: 160,
      cellRenderer: DateCellRenderer,
      filter: 'agDateColumnFilter',
      sortable: true,
      sort: 'desc',
    },
    {
      headerName: 'Actions',
      field: 'actions',
      width: 200,
      cellRenderer: ActionsCellRenderer,
      sortable: false,
      filter: false,
      pinned: 'right',
      autoHeight: true,
    },
  ], []);

  const defaultColDef: ColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    filter: true,
    minWidth: 120,
    flex: 1,
  }), []);

  const gridOptions: GridOptions = {
    defaultColDef: {
      flex: 1,
      minWidth: 100,
      resizable: true,
      sortable: true,
      filter: true,
    },
    suppressCellFocus: true,
    suppressRowClickSelection: true,
    suppressMovableColumns: true,
    suppressMenuHide: true,
    context: {
      onViewOrder, // <-- important
    },
  };


  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Beautiful Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-gray-100 rounded-lg">
          <Card
            icon={Package}
            title="Total Orders"
            value={stats?.totalOrders ?? 0}
          />
        </div>

        <div className="bg-yellow-100 rounded-lg">
          <Card
            icon={() => <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-[#5f3c2c]" />}
            title="Pending"
            value={stats?.pendingOrders ?? 0}
          />
        </div>

        <div className="bg-green-100 rounded-lg">
          <Card
            icon={() => <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-[#5f3c2c]" />}
            title="Completed"
            value={stats?.completedOrders ?? 0}
          />
        </div>

        <div className="bg-blue-100 rounded-lg">
          <Card
            icon={() => <Download className="h-5 w-5 sm:h-6 sm:w-6 text-[#5f3c2c]" />}
            title="Revenue"
            value={`${SITE_CONFIG.currencySymbol}${((stats?.totalRevenue ?? 0) / 100).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
          />
        </div>

      </div>

      {/* Orders Grid */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {/* Header with Controls */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Orders Management</h2>
              <p className="text-gray-600 mt-1">
                Manage and track all customer orders ({orders.length} total)
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              {/* Quick Filter */}
              <div className="relative flex-1 lg:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search orders, customers, items..."
                  value={quickFilterText}
                  onChange={(e) => setQuickFilterText(e.target.value)}
                  className="w-full lg:w-80 pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white shadow-sm"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200 shadow-sm"
                  title="Refresh data"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                <button
                  onClick={onExportCsv}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium  text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200 shadow-sm"
                  title="Export to CSV"
                >
                  <FileDown className="h-4 w-4" />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AG Grid */}
        <div className="ag-theme-alpine-custom overflow-hidden rounded-lg" style={{ height: '600px', width: '100%' }}>
          <AgGridReact
            ref={gridRef}
            rowData={orders}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            gridOptions={gridOptions}
            onGridReady={onGridReady}
            quickFilterText={quickFilterText}
            suppressMenuHide={false}
            rowSelection="multiple"
            domLayout="normal"
            suppressHorizontalScroll={false}
            alwaysShowHorizontalScroll={false}
            suppressColumnVirtualisation={false}
          />
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

// New component for Copy to Clipboard functionality
const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }, [textToCopy]);

  return (
    <button
      onClick={handleCopy}
      className='ml-2 flex items-center text-gray-600 space-x-1 px-2 py-1 rounded-md text-xs font-medium transition-colors duration-200 focus:outline-none'
      title={isCopied ? 'Copied!' : 'Copy Product ID'}
    >
      {isCopied ? (
        <Check className="h-3 w-3" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
      <span>{isCopied ? 'Copied' : 'Copy'}</span>
    </button>
  );
};

// New component to render the list of items in the modal
const OrderItemList: React.FC<{ items: OrderItem[] }> = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Package className="h-12 w-12 mx-auto mb-2" />
        <p>No items found in this order.</p>
      </div>
    );
  }

  return (
    <ul role="list" className="divide-y divide-gray-200">
      {items.map((item, index) => (
        <li key={index} className="flex py-4 px-1">
          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
            <img
              src={item.image?.startsWith('http') ? item.image : `${staticImageBaseUrl}${item.image}`}
              alt={item.name}
              className="h-full w-full object-cover object-center"
            />
          </div>

          <div className="ml-4 flex flex-1 flex-col">
            <div className="flex justify-between text-base font-medium text-gray-900">
              <h3>{item.name}</h3>
              <p className="ml-4">
                {SITE_CONFIG.currencySymbol}
                {(item.price * item.quantity).toLocaleString()}
              </p>
            </div>

            <div className="flex flex-col text-sm text-gray-500 space-y-1">
              <p>Qty: {item.quantity}</p>
              {item.selectedSize && item.productId && (
                <p>Size: {item.selectedSize}</p>
              )}
            </div>

            <div className="flex items-center mt-2">
              <span className="text-gray-700 text-sm mr-2">Product ID:</span>
              <span className="text-gray-600 font-mono text-xs">{item.productId}</span>
              <CopyButton textToCopy={item.productId} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};


// Enhanced Order Detail Modal
const OrderDetailModal: React.FC<{
  order: Order;
  onClose: () => void;
}> = ({ order, onClose }) => {

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-serif text-[#4A3F36]">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={onClose}
        ></div>

        <div className="inline-block w-full max-w-6xl p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-[#FAF9F6] shadow-2xl rounded-2xl">
          {/* Header */}
          <div className="bg-[#DEC9A3] px-8 py-6 text-[#4A3F36]">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl italic font-semibold">Order Details</h3>
              <button
                onClick={onClose}
                className="hover:text-[#804000] focus:outline-none p-2 hover:bg-[#F2ECE4] rounded-lg transition-all duration-200"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Order Info */}
              <div className="space-y-6">
                <div className="bg-[#F2ECE4] rounded-xl p-6 shadow-sm">
                  <h4 className="italic font-semibold text-lg mb-4 flex items-center">
                    <Package className="h-5 w-5 mr-2 text-[#4A3F36]" />
                    Order Information
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-[#DEC9A3]">
                      <span className="font-light italic">Order ID:</span>
                      <span className="font-semibold">{order.id}</span>
                    </div>
                    {order.orderId && (
                      <div className="flex justify-between py-2 border-b border-[#DEC9A3]">
                        <span className="font-light italic">Razorpay Order ID:</span>
                        <span className="font-mono text-xs break-all">{order.orderId}</span>
                      </div>
                    )}
                    {order.secondOrderId && (
                      <div className="flex justify-between py-2 border-b border-[#DEC9A3]">
                        <span className="font-light italic">Second Payment ID:</span>
                        <span className="font-mono text-xs break-all">{order.secondOrderId}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-[#DEC9A3]">
                      <span className="font-light italic">Tracking Number:</span>
                      <span className="font-semibold">
                        {order.trackingNumber || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[#DEC9A3]">
                      <span className="font-light italic">Status:</span>
                      <StatusCellRenderer value={order.status} />
                    </div>
                    <div className="flex justify-between py-2 border-b border-[#DEC9A3]">
                      <span className="font-light italic">Date:</span>
                      <span className="font-light">{formatReadableDate(order.createdAt)}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="font-light italic">Total Amount:</span>
                      <span className="text-xl font-semibold text-[#804000]">
                        {SITE_CONFIG.currencySymbol}
                        {(order.amount / 100).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    
                    {order.isHalfPaid && (
                      <>
                        <div className="flex justify-between py-2 border-b border-[#DEC9A3]">
                          <span className="font-light italic">Payment Type:</span>
                          <span className="font-semibold text-blue-600">Half Payment</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[#DEC9A3]">
                          <span className="font-light italic">Remaining Amount:</span>
                          <span className="font-semibold text-yellow-600">
                            {SITE_CONFIG.currencySymbol}
                            {((order.remainingAmount || 0) / 100).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="font-light italic">Remaining Status:</span>
                          <span className={`font-semibold ${order.halfPaymentStatus === 'pending' ? 'text-yellow-600' : 'text-green-600'}`}>
                            {order.halfPaymentStatus === 'pending' ? 'Pending' : 'Paid'}
                          </span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="font-light italic">Remaining Payment:</span>
                          <span className={`font-semibold ${order.enableRemainingPayment ? 'text-green-600' : 'text-gray-600'}`}>
                            {order.enableRemainingPayment ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-[#F2ECE4] rounded-xl p-6 shadow-sm">
                  <h4 className="italic font-semibold text-lg mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-[#4A3F36]" />
                    Shipping Address
                  </h4>
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-[#DEC9A3]">
                    <AddressCellRenderer value={order.shippingAddress} />
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-[#F2ECE4] rounded-xl p-6 shadow-sm">
                <h4 className="italic font-semibold text-lg mb-4 flex items-center">
                  <Package className="h-5 w-5 mr-2 text-[#4A3F36]" />
                  Order Items ({order.items.length})
                </h4>
                <div className="bg-white rounded-lg p-2 max-h-96 overflow-y-auto shadow-sm border border-[#DEC9A3]">
                  <OrderItemList items={order.items} />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-3 text-sm font-semibold italic text-[#4A3F36] bg-[#DEC9A3] rounded-lg hover:bg-[#d1b990] transition-all duration-200 shadow-sm"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );


};

export default OrderManagement;