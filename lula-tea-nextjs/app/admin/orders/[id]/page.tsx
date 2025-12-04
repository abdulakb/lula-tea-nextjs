"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { supabase } from "@/lib/supabaseClient";

interface Order {
  id: string;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  delivery_notes: string;
  total: number;
  subtotal: number;
  delivery_fee: number;
  payment_method: string;
  status: string;
  created_at: string;
  updated_at: string;
  items: any[];
  invoice_base64: string;
  notes?: string;
}

interface OrderNote {
  id: string;
  note: string;
  created_by: string;
  created_at: string;
}

export default function OrderDetail() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [orderNotes, setOrderNotes] = useState<OrderNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push("/admin");
      return;
    }
    fetchOrder();
    fetchOrderNotes();
  }, [router, orderId]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (err) {
      console.error("Error fetching order:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderNotes = async () => {
    try {
      const { data, error } = await supabase
        .from("order_notes")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrderNotes(data || []);
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;

    try {
      setAddingNote(true);
      const { data, error } = await supabase
        .from("order_notes")
        .insert([{
          order_id: orderId,
          note: newNote.trim(),
          created_by: "admin"
        }])
        .select()
        .single();

      if (error) throw error;
      
      setOrderNotes([data, ...orderNotes]);
      setNewNote("");
      alert("Note added successfully!");
    } catch (err) {
      console.error("Error adding note:", err);
      alert("Failed to add note");
    } finally {
      setAddingNote(false);
    }
  };

  const downloadInvoice = () => {
    if (!order?.invoice_base64) return;

    const byteCharacters = atob(order.invoice_base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Invoice-${order.order_id}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tea-green mx-auto mb-4"></div>
          <p className="text-tea-brown">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-warm-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-tea-brown mb-4">Order not found</p>
          <Link href="/admin/orders" className="text-tea-green hover:underline">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;

  const handleSendInvoiceWhatsApp = () => {
    const invoiceUrl = `${window.location.origin}/api/invoice/${order.order_id}`;
    const message = `✅ تأكيد طلبك من لولا تي\nOrder Confirmation from Lula Tea\n\nرقم الطلب / Order ID: ${order.order_id}\nالإجمالي / Total: ${order.total} SAR\n\nتحميل الفاتورة / Download Invoice:\n${invoiceUrl}\n\nشكراً لك! Thank you! 🍵`;
    
    const phone = order.customer_phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-warm-cream py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Order Details
            </h1>
            <p className="text-gray-700 dark:text-gray-300">Order ID: {order.order_id}</p>
          </div>
          <Link
            href="/admin/orders"
            className="bg-tea-brown text-white px-6 py-2 rounded-lg hover:bg-tea-brown/90 transition-colors"
          >
            Back to Orders
          </Link>
        </div>

        {/* Order Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                {order.status}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Order Date</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Customer Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Name</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {order.customer_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Phone</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  <a
                    href={`https://wa.me/${order.customer_phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-tea-green hover:underline"
                  >
                    {order.customer_phone}
                  </a>
                </p>
                <button
                  onClick={handleSendInvoiceWhatsApp}
                  className="bg-[#25D366] text-white px-4 py-2 rounded-lg hover:bg-[#22c55e] transition-colors text-sm flex items-center gap-2"
                  title="Send invoice via WhatsApp"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  Send Invoice
                </button>
              </div>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Delivery Address</p>
              <p className="text-lg text-gray-900 dark:text-white">{order.customer_address}</p>
            </div>
            {order.delivery_notes && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Delivery Notes</p>
                <p className="text-lg text-gray-900 dark:text-white">{order.delivery_notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Order Items</h2>
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Item
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                    Price
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any, index: number) => (
                  <tr key={index} className="border-t border-gray-200 dark:border-gray-600">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                      {item.price} SAR
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900 dark:text-white">
                      {item.price * item.quantity} SAR
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-gray-700">
                <tr className="border-t-2 border-tea-green">
                  <td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                    Subtotal:
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                    {order.subtotal} SAR
                  </td>
                </tr>
                {order.delivery_fee > 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                      Delivery Fee:
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                      {order.delivery_fee} SAR
                    </td>
                  </tr>
                )}
                <tr className="border-t border-tea-green">
                  <td colSpan={3} className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white text-lg">
                    Total:
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-tea-green text-lg">
                    {order.total} SAR
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Payment Information
          </h2>
          <p className="text-lg text-gray-900 dark:text-white">
            <span className="font-semibold">Payment Method:</span>{" "}
            {order.payment_method === "cod" ? "Cash on Delivery" : "WhatsApp Order"}
          </p>
        </div>

        {/* Order Notes / Comments */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-tea-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            Order Notes
          </h2>
          
          {/* Add New Note */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Add a note
            </label>
            <div className="flex gap-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add internal notes about this order..."
                rows={3}
                className="flex-1 px-4 py-2 border border-tea-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green resize-none"
              />
              <button
                onClick={addNote}
                disabled={!newNote.trim() || addingNote}
                className="px-6 py-2 bg-tea-green text-white rounded-lg font-medium hover:bg-tea-green/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors self-end"
              >
                {addingNote ? "Adding..." : "Add Note"}
              </button>
            </div>
          </div>

          {/* Notes List */}
          <div className="space-y-3">
            {orderNotes.length === 0 ? (
              <div className="text-center py-8 text-tea-brown bg-warm-cream/30 rounded-lg">
                <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p>No notes yet. Add one above to track order updates.</p>
              </div>
            ) : (
              orderNotes.map((note) => (
                <div key={note.id} className="border border-tea-brown/20 rounded-lg p-4 bg-warm-cream/20">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-tea-green uppercase">{note.created_by}</span>
                    <span className="text-xs text-tea-brown">
                      {new Date(note.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-deep-brown whitespace-pre-wrap">{note.note}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          {order.invoice_base64 && (
            <button
              onClick={downloadInvoice}
              className="flex-1 bg-tea-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-tea-green/90 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Invoice
            </button>
          )}
          <a
            href={`https://wa.me/${order.customer_phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-[#25D366] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#22c55e] transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Contact Customer
          </a>
        </div>
      </div>
    </div>
  );
}
