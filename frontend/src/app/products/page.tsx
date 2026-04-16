"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import ProductService from "@/services/product/service";
import {
  ProductAddRequest,
  ProductResponse,
  ProductModifyRequest,
} from "@/services/product/schema";

export default function SellerProductsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ["seller-products", user?.id, page],
    queryFn: () => ProductService.getProductsBySeller(user!.id, page, LIMIT),
    enabled: !!user?.id,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductAddRequest>();

  const addProductMutation = useMutation({
    mutationFn: (newProduct: ProductAddRequest) =>
      ProductService.addProduct(newProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      closeModal();
    },
  });

  const editProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductModifyRequest }) =>
      ProductService.modifyProduct(data, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      closeModal();
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => ProductService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
    },
  });

  const onSubmit = (data: ProductAddRequest) => {
    if (editingProduct) {
      editProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      addProductMutation.mutate(data);
    }
  };

  const openEditModal = (product: ProductResponse) => {
    setEditingProduct(product);
    setValue("name", product.name);
    setValue("description", product.description);
    setValue("price", product.price);
    setValue("stock", product.stock);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    reset();
  };

  const products = data?.data || [];

  return (
    <div className="min-h-full bg-white px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-black uppercase">
              My Inventory
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              Manage and track your listed products.
            </p>
          </div>
          <button
            onClick={() => {
              reset();
              setIsModalOpen(true);
            }}
            className="px-6 py-3 bg-black text-white text-sm font-bold rounded-lg hover:bg-zinc-800 transition-all flex items-center gap-2"
          >
            <span>Add New Product</span>
          </button>
        </div>

        {/* Products Table/List */}
        <div className="bg-white border border-black/5 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-black/5">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">
                  Product Details
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">
                  Price
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">
                  Stock
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400 text-right pr-10">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-6">
                      <div className="h-4 bg-zinc-100 rounded w-1/2"></div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="h-4 bg-zinc-100 rounded w-1/4"></div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="h-4 bg-zinc-100 rounded w-1/4"></div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="h-4 bg-zinc-100 rounded w-1/4"></div>
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-zinc-500 font-medium"
                  >
                    No products listed yet. Click "Add New Product" to get
                    started.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-zinc-50 transition-colors"
                  >
                    <td className="px-6 py-6">
                      <div className="font-bold text-black">{product.name}</div>
                      <div className="text-xs text-zinc-500 mt-1 line-clamp-1">
                        {product.description}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-sm font-bold text-black">
                      Rs. {product.price}
                    </td>
                    <td className="px-6 py-6">
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${product.stock > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                      >
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right pr-10 space-x-4">
                      <button
                        onClick={() => openEditModal(product)}
                        className="text-xs font-black uppercase tracking-widest text-black border-b-2 border-transparent hover:border-black transition-all cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to delete this product?",
                            )
                          ) {
                            deleteProductMutation.mutate(product.id);
                          }
                        }}
                        className="text-xs font-black uppercase tracking-widest text-red-500 border-b-2 border-transparent hover:border-red-500 transition-all cursor-pointer"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination placeholder */}
        <div className="mt-8 flex justify-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 border border-black/10 rounded text-xs font-bold disabled:opacity-30"
          >
            Prev
          </button>
          <button
            disabled={products.length < LIMIT}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 border border-black/10 rounded text-xs font-bold disabled:opacity-30"
          >
            Next
          </button>
        </div>
      </div>

      {/* Product Modal (Add/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black tracking-tight text-black uppercase">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={closeModal}
                className="text-zinc-400 hover:text-black transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-500">
                  Product Name
                </label>
                <input
                  {...register("name", { required: "Name is required" })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-transparent rounded-xl focus:bg-white focus:border-black outline-none transition-all placeholder:text-zinc-400"
                  placeholder="Premium Leather Wallet"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-500">
                  Description
                </label>
                <textarea
                  {...register("description", {
                    required: "Description is required",
                  })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-transparent rounded-xl focus:bg-white focus:border-black outline-none transition-all placeholder:text-zinc-400 h-32"
                  placeholder="Handcrafted from top-grain leather..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">
                    Price (Rs.)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("price", {
                      required: "Price is required",
                      valueAsNumber: true,
                    })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-transparent rounded-xl focus:bg-white focus:border-black outline-none transition-all"
                    placeholder="99.99"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">
                    Stock Count
                  </label>
                  <input
                    type="number"
                    {...register("stock", {
                      required: "Stock is required",
                      valueAsNumber: true,
                    })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-transparent rounded-xl focus:bg-white focus:border-black outline-none transition-all"
                    placeholder="50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  addProductMutation.isPending || editProductMutation.isPending
                }
                className="w-full py-4 bg-black text-white font-black uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-all disabled:bg-zinc-300 mt-4"
              >
                {addProductMutation.isPending || editProductMutation.isPending
                  ? "Processing..."
                  : editingProduct
                    ? "Update Product"
                    : "Publish Product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
