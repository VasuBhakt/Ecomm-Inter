"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ProductService } from "@/services/product";
import OrderService from "@/services/order/service";
import { useAuth } from "@/hooks/useAuth";

export default function ProductDetailsPage() {
  const { productId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => ProductService.getProduct(productId as string),
    enabled: !!productId,
  });

  const placeOrderMutation = useMutation({
    mutationFn: (data: { product_id: string; quantity: number }) =>
      OrderService.addOrder(data),
    onSuccess: () => {
      router.push("/orders");
    },
  });

  const product = data?.data;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          <div className="aspect-square bg-zinc-50 rounded-3xl" />
          <div className="space-y-8 py-8">
            <div className="h-12 bg-zinc-50 rounded-xl w-3/4" />
            <div className="h-6 bg-zinc-50 rounded-lg w-1/4" />
            <div className="space-y-3">
              <div className="h-4 bg-zinc-50 rounded w-full" />
              <div className="h-4 bg-zinc-50 rounded w-full" />
              <div className="h-4 bg-zinc-50 rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-32 text-center">
        <h2 className="text-2xl font-black text-black tracking-tight">
          PRODUCT NOT FOUND
        </h2>
        <p className="text-zinc-500 mt-2 mb-8 uppercase tracking-widest text-[10px] font-bold">
          The item may have been removed.
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-8 py-3 bg-black text-white text-xs font-black uppercase tracking-widest rounded-full hover:bg-zinc-800 transition-all"
        >
          Return to Store
        </button>
      </div>
    );
  }

  const handleOrder = () => {
    if (!user) {
      router.push("/signin");
      return;
    }
    placeOrderMutation.mutate({ product_id: product.id, quantity });
  };

  return (
    <div className="bg-white min-h-full selection:bg-black selection:text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        {/* Breadcrumb */}
        <nav className="mb-12 flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
          <button
            onClick={() => router.push("/")}
            className="hover:text-black transition-colors"
          >
            Store
          </button>
          <span>/</span>
          <span className="text-black">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          {/* Aesthetic Product Showcase */}
          <div className="relative group">
            <div className="aspect-square bg-zinc-50 rounded-[3rem] border border-black/5 flex items-center justify-center transition-all duration-700 group-hover:rounded-[2rem] group-hover:bg-zinc-100 overflow-hidden relative">
              <span className="text-[12rem] font-black opacity-[0.03] select-none group-hover:opacity-[0.06] transition-opacity duration-700">
                {product.name.charAt(0)}
              </span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1/2 h-1/2 border-2 border-black/5 rounded-full animate-pulse" />
              </div>
            </div>
          </div>

          {/* Core Product Information */}
          <div className="flex flex-col">
            <div className="mb-10">
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-black uppercase leading-[0.9] mb-4">
                {product.name}
              </h1>
              <div className="flex items-center gap-6">
                <span className="text-3xl font-black text-black">
                  Rs. {product.price}
                </span>
                <span
                  className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border ${product.stock > 0 ? "border-green-100 bg-green-50/50 text-green-700" : "border-red-100 bg-red-50/50 text-red-700"}`}
                >
                  {product.stock > 0
                    ? `${product.stock} available`
                    : "Sold Out"}
                </span>
              </div>
            </div>

            <div className="mb-12">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 block mb-4">
                Product Overview
              </label>
              <p className="text-zinc-600 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
                {product.description}
              </p>
            </div>

            {/* Ordering Section */}
            {user?.role == "buyer" ? (
              <div className="mt-auto pt-10 border-t border-black/5">
                {product.stock > 0 ? (
                  <div className="space-y-8">
                    <div className="flex flex-wrap gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                          Select Quantity
                        </label>
                        <div className="flex items-center border-2 border-black rounded-2xl overflow-hidden h-14 w-32">
                          <button
                            onClick={() =>
                              setQuantity((q) => Math.max(1, q - 1))
                            }
                            className="flex-1 h-full hover:bg-zinc-50 transition-colors font-bold text-xl"
                          >
                            -
                          </button>
                          <span className="w-10 text-center font-black text-lg">
                            {quantity}
                          </span>
                          <button
                            onClick={() =>
                              setQuantity((q) => Math.min(product.stock, q + 1))
                            }
                            className="flex-1 h-full hover:bg-zinc-50 transition-colors font-bold text-xl"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                          Checkout Price
                        </label>
                        <div className="h-14 flex items-center text-3xl font-black">
                          Rs. {product.price * quantity}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleOrder}
                      disabled={placeOrderMutation.isPending}
                      className="w-full py-6 bg-black text-white text-sm font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-zinc-800 transition-all transform active:scale-[0.99] disabled:bg-zinc-200 shadow-xl shadow-black/5 flex items-center justify-center gap-4"
                    >
                      {placeOrderMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          <span>Validating...</span>
                        </>
                      ) : (
                        "Place Instant Order"
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="py-8 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200 text-center">
                    <p className="text-zinc-400 font-black uppercase tracking-widest text-xs">
                      Currently Unavailable
                    </p>
                  </div>
                )}

                <div className="mt-10 flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 border-t border-black/5 pt-6">
                  <span>Secure Payments</span>
                  <span className="text-zinc-200">•</span>
                  <span>Fast Delivery</span>
                  <span className="text-zinc-200">•</span>
                  <span>Quality Assured</span>
                </div>
              </div>
            ) : (
              <div className="mt-auto pt-10 border-t border-black/5">
                <p className="text-zinc-400 font-black uppercase tracking-widest text-xs">
                  You are not authorized to place orders
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
