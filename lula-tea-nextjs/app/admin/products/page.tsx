"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import ThemeToggle from "@/app/components/ThemeToggle";

interface Product {
  id: string;
  name: string;
  name_ar?: string;
  description?: string;
  description_ar?: string;
  price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  available: boolean;
  image_url?: string;
  category?: string;
  sku?: string;
  created_at: string;
  updated_at: string;
}

export default function ProductsManagement() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    name_ar: "",
    description: "",
    description_ar: "",
    price: "",
    stock_quantity: "",
    low_stock_threshold: "10",
    category: "",
    sku: "",
    available: true,
  });

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push("/admin");
      return;
    }
    fetchProducts();
  }, [router]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/admin/products?admin=true");
      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        low_stock_threshold: parseInt(formData.low_stock_threshold),
      };

      if (editingProduct) {
        // Update existing product
        const response = await fetch("/api/admin/products", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingProduct.id, ...productData }),
        });

        if (!response.ok) throw new Error("Failed to update product");
      } else {
        // Create new product
        const response = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });

        if (!response.ok) throw new Error("Failed to create product");
      }

      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`/api/admin/products?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete product");

      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    }
  };

  const handleToggleAvailability = async (product: Product) => {
    try {
      const response = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product.id,
          available: !product.available,
        }),
      });

      if (!response.ok) throw new Error("Failed to update availability");

      fetchProducts();
    } catch (error) {
      console.error("Error updating availability:", error);
      alert("Failed to update availability");
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      name_ar: product.name_ar || "",
      description: product.description || "",
      description_ar: product.description_ar || "",
      price: product.price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      low_stock_threshold: product.low_stock_threshold.toString(),
      category: product.category || "",
      sku: product.sku || "",
      available: product.available,
    });
    setShowModal(true);
  };

  const openNewModal = () => {
    setEditingProduct(null);
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      name_ar: "",
      description: "",
      description_ar: "",
      price: "",
      stock_quantity: "",
      low_stock_threshold: "10",
      category: "",
      sku: "",
      available: true,
    });
  };

  const filteredProducts = products.filter((product) => {
    const searchLower = search.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.name_ar?.toLowerCase().includes(searchLower) ||
      product.sku?.toLowerCase().includes(searchLower) ||
      product.category?.toLowerCase().includes(searchLower)
    );
  });

  const lowStockProducts = products.filter(
    (p) => p.stock_quantity <= p.low_stock_threshold && p.available
  );
  const outOfStockProducts = products.filter(
    (p) => p.stock_quantity === 0 && p.available
  );
  const totalValue = products.reduce(
    (sum, p) => sum + p.price * p.stock_quantity,
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-cream dark:bg-gray-900 flex items-center justify-center dark-transition">
        <ThemeToggle />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tea-green mx-auto mb-4"></div>
          <p className="text-tea-brown dark:text-gray-300">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-cream dark:bg-gray-900 py-8 md:py-20 px-4 dark-transition">
      <ThemeToggle />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-deep-brown dark:text-deep-brown mb-2">
              Product Management
            </h1>
            <p className="text-tea-brown dark:text-gray-400">
              Manage your product catalog and inventory
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={openNewModal}
              className="bg-tea-green text-white px-6 py-2 rounded-lg hover:bg-tea-green/90 transition-colors"
            >
              + Add Product
            </button>
            <Link
              href="/admin"
              className="bg-tea-brown text-white px-6 py-2 rounded-lg hover:bg-tea-brown/90 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 dark-transition">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-tea-brown dark:text-gray-400 font-medium text-sm">
                Total Products
              </h3>
              <svg
                className="w-8 h-8 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <p className="text-3xl font-bold text-deep-brown dark:text-white">
              {products.length}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 dark-transition">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-tea-brown dark:text-gray-400 font-medium text-sm">
                Low Stock Alerts
              </h3>
              <svg
                className="w-8 h-8 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="text-3xl font-bold text-deep-brown dark:text-white">
              {lowStockProducts.length}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 dark-transition">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-tea-brown dark:text-gray-400 font-medium text-sm">
                Out of Stock
              </h3>
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="text-3xl font-bold text-deep-brown dark:text-white">
              {outOfStockProducts.length}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 dark-transition">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-tea-brown dark:text-gray-400 font-medium text-sm">
                Inventory Value
              </h3>
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-3xl font-bold text-deep-brown dark:text-white">
              {totalValue.toFixed(0)} SAR
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 dark-transition">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU, or category..."
            className="w-full px-4 py-2 border border-tea-brown/30 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green bg-white dark:bg-gray-700 text-deep-brown dark:text-white dark-transition"
          />
        </div>

        {/* Products Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden dark-transition">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-tea-green text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Product</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">SKU</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Price</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">Stock</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-tea-brown dark:text-gray-400"
                    >
                      No products found
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-warm-cream/30 dark:hover:bg-gray-700/30 dark-transition"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-deep-brown dark:text-white">
                            {product.name}
                          </p>
                          {product.name_ar && (
                            <p className="text-sm text-tea-brown dark:text-gray-400">
                              {product.name_ar}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-tea-brown dark:text-gray-300">
                        {product.sku || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-tea-brown dark:text-gray-300">
                        {product.category || "-"}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-deep-brown dark:text-white">
                        {product.price.toFixed(2)} SAR
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-semibold ${
                            product.stock_quantity === 0
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : product.stock_quantity <= product.low_stock_threshold
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          }`}
                        >
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleAvailability(product)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            product.available
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {product.available ? "Available" : "Unavailable"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 text-tea-brown dark:text-gray-400 text-sm">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto dark-transition">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-deep-brown dark:text-white">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-deep-brown dark:text-gray-300 mb-2">
                      Product Name (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-tea-brown/30 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green bg-white dark:bg-gray-700 text-deep-brown dark:text-white dark-transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-deep-brown dark:text-gray-300 mb-2">
                      Product Name (Arabic)
                    </label>
                    <input
                      type="text"
                      value={formData.name_ar}
                      onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                      className="w-full px-4 py-2 border border-tea-brown/30 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green bg-white dark:bg-gray-700 text-deep-brown dark:text-white dark-transition"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-deep-brown dark:text-gray-300 mb-2">
                    Description (English)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-tea-brown/30 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green bg-white dark:bg-gray-700 text-deep-brown dark:text-white dark-transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-deep-brown dark:text-gray-300 mb-2">
                    Description (Arabic)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description_ar}
                    onChange={(e) =>
                      setFormData({ ...formData, description_ar: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-tea-brown/30 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green bg-white dark:bg-gray-700 text-deep-brown dark:text-white dark-transition"
                    dir="rtl"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-deep-brown dark:text-gray-300 mb-2">
                      Price (SAR) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2 border border-tea-brown/30 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green bg-white dark:bg-gray-700 text-deep-brown dark:text-white dark-transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-deep-brown dark:text-gray-300 mb-2">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.stock_quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, stock_quantity: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-tea-brown/30 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green bg-white dark:bg-gray-700 text-deep-brown dark:text-white dark-transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-deep-brown dark:text-gray-300 mb-2">
                      Low Stock Alert
                    </label>
                    <input
                      type="number"
                      value={formData.low_stock_threshold}
                      onChange={(e) =>
                        setFormData({ ...formData, low_stock_threshold: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-tea-brown/30 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green bg-white dark:bg-gray-700 text-deep-brown dark:text-white dark-transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-deep-brown dark:text-gray-300 mb-2">
                      SKU
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-4 py-2 border border-tea-brown/30 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green bg-white dark:bg-gray-700 text-deep-brown dark:text-white dark-transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-deep-brown dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-tea-brown/30 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green bg-white dark:bg-gray-700 text-deep-brown dark:text-white dark-transition"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="available"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    className="w-4 h-4 text-tea-green border-tea-brown/30 rounded focus:ring-tea-green"
                  />
                  <label
                    htmlFor="available"
                    className="text-sm font-medium text-deep-brown dark:text-gray-300"
                  >
                    Product Available for Sale
                  </label>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-tea-green text-white px-6 py-2 rounded-lg hover:bg-tea-green/90 transition-colors"
                  >
                    {editingProduct ? "Update Product" : "Add Product"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingProduct(null);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white px-6 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
