'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/i18n';
import AuthModal from '@/app/components/AuthModal';

interface Customer {
  id: number;
  phone: string;
  name: string;
  email: string | null;
  address: string | null;
  city: string | null;
  verified: boolean;
  created_at: string;
}

interface Order {
  id: number;
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  delivery_address: string;
  city: string;
  total_amount: number;
  status: string;
  payment_method: string;
  order_details: any;
  created_at: string;
  updated_at: string;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, { en: string; ar: string }> = {
  pending: { en: 'Pending', ar: 'قيد الانتظار' },
  processing: { en: 'Processing', ar: 'قيد المعالجة' },
  confirmed: { en: 'Confirmed', ar: 'مؤكد' },
  shipped: { en: 'Shipped', ar: 'تم الشحن' },
  delivered: { en: 'Delivered', ar: 'تم التسليم' },
  cancelled: { en: 'Cancelled', ar: 'ملغي' },
};

export default function CustomerDashboard() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];
  const isRTL = language === 'ar';

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    delivery_address: '',
    city: '',
    delivery_notes: '',
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const customerData = localStorage.getItem('lula_customer');
    if (customerData) {
      const parsedCustomer = JSON.parse(customerData);
      setCustomer(parsedCustomer);
      fetchOrders(parsedCustomer.id);
    } else {
      setShowAuthModal(true);
      setLoading(false);
    }
  };

  const fetchOrders = async (customerId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/customer/orders?customer_id=${customerId}`);
      const data = await response.json();
      
      if (response.ok) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (customerData: Customer) => {
    setCustomer(customerData);
    setShowAuthModal(false);
    fetchOrders(customerData.id);
  };

  const handleLogout = () => {
    localStorage.removeItem('lula_customer');
    setCustomer(null);
    setOrders([]);
    router.push('/');
  };

  const handleEditOrder = () => {
    if (!selectedOrder) return;
    
    setEditForm({
      customer_name: selectedOrder.customer_name || '',
      customer_email: selectedOrder.customer_email || '',
      customer_phone: selectedOrder.customer_phone || '',
      delivery_address: selectedOrder.delivery_address || '',
      city: selectedOrder.city || '',
      delivery_notes: selectedOrder.order_details?.delivery_notes || '',
    });
    setIsEditMode(true);
  };

  const handleSaveOrder = async () => {
    if (!customer || !selectedOrder) return;

    setActionLoading(true);
    try {
      const response = await fetch('/api/customer/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          customerId: customer.id,
          action: 'update',
          updates: editForm,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update order in state
        setOrders(orders.map(order => 
          order.id === selectedOrder.id ? data.order : order
        ));
        setSelectedOrder(data.order);
        setIsEditMode(false);
        alert(language === 'en' ? 'Order updated successfully' : 'تم تحديث الطلب بنجاح');
      } else {
        alert(data.error || (language === 'en' ? 'Failed to update order' : 'فشل تحديث الطلب'));
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert(language === 'en' ? 'An error occurred' : 'حدث خطأ');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!customer) return;

    const confirmMessage = language === 'en'
      ? 'Are you sure you want to cancel this order?'
      : 'هل أنت متأكد من إلغاء هذا الطلب؟';

    if (!confirm(confirmMessage)) return;

    setActionLoading(true);
    try {
      const response = await fetch('/api/customer/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          customerId: customer.id,
          action: 'cancel',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update order in state
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: 'cancelled' } : order
        ));
        setSelectedOrder(null);
        setIsEditMode(false);
        alert(language === 'en' ? 'Order cancelled successfully' : 'تم إلغاء الطلب بنجاح');
      } else {
        alert(data.error || (language === 'en' ? 'Failed to cancel order' : 'فشل إلغاء الطلب'));
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert(language === 'en' ? 'An error occurred' : 'حدث خطأ');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return language === 'en'
      ? date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      : date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (showAuthModal) {
    return (
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => router.push('/')}
        onSuccess={handleAuthSuccess}
        language={language}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tea-green"></div>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-deep-brown mb-2">
                {language === 'en' ? `Welcome, ${customer.name}` : `مرحباً، ${customer.name}`}
              </h1>
              <p className="text-gray-600">{customer.phone}</p>
              {customer.email && <p className="text-gray-600">{customer.email}</p>}
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              {language === 'en' ? 'Logout' : 'تسجيل الخروج'}
            </button>
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-deep-brown mb-6">
            {language === 'en' ? 'Order History' : 'سجل الطلبات'}
          </h2>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-gray-500 text-lg">
                {language === 'en' ? 'No orders yet' : 'لا توجد طلبات بعد'}
              </p>
              <button
                onClick={() => router.push('/product')}
                className="mt-4 px-6 py-2 bg-tea-green text-white rounded-lg hover:bg-opacity-90 transition"
              >
                {language === 'en' ? 'Start Shopping' : 'ابدأ التسوق'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        {language === 'en' ? 'Order' : 'طلب'} #{order.id}
                      </p>
                      <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status as keyof typeof statusColors]}`}>
                      {statusLabels[order.status]?.[language] || order.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="text-sm text-gray-600">
                      <p>{order.city}</p>
                      <p className="truncate max-w-xs">{order.delivery_address}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-tea-green">
                        {order.total_amount} {language === 'en' ? 'SAR' : 'ر.س'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-deep-brown">
                    {language === 'en' ? 'Order Details' : 'تفاصيل الطلب'}
                  </h3>
                  <p className="text-gray-500">
                    {language === 'en' ? 'Order' : 'طلب'} #{selectedOrder.id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Status */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">{language === 'en' ? 'Status' : 'الحالة'}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedOrder.status as keyof typeof statusColors]}`}>
                    {statusLabels[selectedOrder.status]?.[language] || selectedOrder.status}
                  </span>
                </div>

                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">{language === 'en' ? 'Order Date' : 'تاريخ الطلب'}</p>
                    <p className="font-medium">{formatDate(selectedOrder.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{language === 'en' ? 'Payment Method' : 'طريقة الدفع'}</p>
                    <p className="font-medium">
                      {selectedOrder.payment_method === 'cod' 
                        ? (language === 'en' ? 'Cash on Delivery' : 'الدفع عند الاستلام')
                        : (language === 'en' ? 'Online Payment' : 'الدفع الإلكتروني')}
                    </p>
                  </div>
                </div>

                {/* Delivery Info */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">{language === 'en' ? 'Delivery Address' : 'عنوان التوصيل'}</p>
                  {isEditMode ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editForm.delivery_address}
                        onChange={(e) => setEditForm({...editForm, delivery_address: e.target.value})}
                        placeholder={language === 'en' ? 'Delivery Address' : 'عنوان التوصيل'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green"
                      />
                      <input
                        type="text"
                        value={editForm.city}
                        onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                        placeholder={language === 'en' ? 'City' : 'المدينة'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green"
                      />
                      <textarea
                        value={editForm.delivery_notes}
                        onChange={(e) => setEditForm({...editForm, delivery_notes: e.target.value})}
                        placeholder={language === 'en' ? 'Delivery Notes (Optional)' : 'ملاحظات التوصيل (اختياري)'}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="font-medium">{selectedOrder.delivery_address}</p>
                      <p className="text-gray-600">{selectedOrder.city}</p>
                      {selectedOrder.order_details?.delivery_notes && (
                        <p className="text-sm text-gray-500 mt-1">
                          {language === 'en' ? 'Notes: ' : 'ملاحظات: '}{selectedOrder.order_details.delivery_notes}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Order Items */}
                {selectedOrder.order_details && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">{language === 'en' ? 'Items' : 'المنتجات'}</p>
                    <div className="space-y-2">
                      {selectedOrder.order_details.items?.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b">
                          <div>
                            <p className="font-medium">{language === 'en' ? item.name_en : item.name_ar}</p>
                            <p className="text-sm text-gray-600">
                              {language === 'en' ? 'Quantity' : 'الكمية'}: {item.quantity}
                            </p>
                          </div>
                          <p className="font-medium">{item.price * item.quantity} {language === 'en' ? 'SAR' : 'ر.س'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold">{language === 'en' ? 'Total' : 'المجموع'}</p>
                    <p className="text-2xl font-bold text-tea-green">
                      {selectedOrder.total_amount} {language === 'en' ? 'SAR' : 'ر.س'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                  <div className="space-y-3">
                    {isEditMode ? (
                      <div className="flex gap-3">
                        <button
                          onClick={handleSaveOrder}
                          disabled={actionLoading}
                          className="flex-1 px-4 py-3 bg-tea-green text-white rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-50 transition"
                        >
                          {actionLoading
                            ? (language === 'en' ? 'Saving...' : 'جاري الحفظ...')
                            : (language === 'en' ? 'Save Changes' : 'حفظ التغييرات')}
                        </button>
                        <button
                          onClick={() => setIsEditMode(false)}
                          disabled={actionLoading}
                          className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 disabled:opacity-50 transition"
                        >
                          {language === 'en' ? 'Cancel' : 'إلغاء'}
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <button
                          onClick={handleEditOrder}
                          className="flex-1 px-4 py-3 bg-tea-green text-white rounded-lg font-semibold hover:bg-opacity-90 transition"
                        >
                          {language === 'en' ? 'Edit Order' : 'تعديل الطلب'}
                        </button>
                        <button
                          onClick={() => handleCancelOrder(selectedOrder.id)}
                          disabled={actionLoading}
                          className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition"
                        >
                          {actionLoading
                            ? (language === 'en' ? 'Cancelling...' : 'جاري الإلغاء...')
                            : (language === 'en' ? 'Cancel Order' : 'إلغاء الطلب')}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
