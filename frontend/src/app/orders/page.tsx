"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import OrderService from "@/services/order/service";
import { OrderResponse } from "@/services/order/schema";

export default function MyOrdersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [editingOrder, setEditingOrder] = useState<OrderResponse | null>(null);
  const [newQuantity, setNewQuantity] = useState(1);
  const LIMIT = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ["my-orders", user?.id, page],
    queryFn: () => OrderService.getOrdersByBuyer(user!.id, page, LIMIT),
    enabled: !!user?.id,
  });

  const deleteOrderMutation = useMutation({
    mutationFn: (id: string) => OrderService.deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
  });

  const modifyOrderMutation = useMutation({
    mutationFn: ({ id, qty }: { id: string; qty: number }) => 
      OrderService.modifyOrder({ quantity: qty }, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      setEditingOrder(null);
    },
  });

  const openEditModal = (order: OrderResponse) => {
    setEditingOrder(order);
    setNewQuantity(order.quantity);
  };

  const handleApplyModification = () => {
    if (editingOrder) {
      modifyOrderMutation.mutate({ id: editingOrder.id, qty: newQuantity });
    }
  };

  const orders = data?.data || [];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return "bg-zinc-100 text-zinc-600 border-zinc-200";
      case "shipped": return "bg-blue-50 text-blue-600 border-blue-100";
      case "delivered": return "bg-green-50 text-green-600 border-green-100";
      case "cancelled": return "bg-red-50 text-red-600 border-red-100";
      default: return "bg-zinc-100 text-zinc-600";
    }
  };

  return (
    <div className="min-h-full bg-white px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black tracking-tighter text-black uppercase">My Orders</h1>
          <p className="text-zinc-500 text-sm mt-2">Track your purchases and order status.</p>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-zinc-50 border border-black/5 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between">
                  <div className="h-4 bg-zinc-200 rounded w-1/3"></div>
                  <div className="h-4 bg-zinc-200 rounded w-1/6"></div>
                </div>
                <div className="h-4 bg-zinc-200 rounded w-1/4"></div>
              </div>
            ))
          ) : error ? (
            <div className="text-center py-20 border-2 border-dashed border-zinc-100 rounded-3xl">
              <p className="text-zinc-500 font-medium">Unable to fetch your orders. Please try again.</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-zinc-100 rounded-3xl">
              <p className="text-zinc-500 text-lg font-bold">You haven't placed any orders yet.</p>
              <button 
                onClick={() => window.location.href = '/'}
                className="mt-4 text-xs font-black uppercase tracking-widest text-black border-b-2 border-black"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="group bg-white border border-black/5 rounded-2xl p-6 hover:border-black/20 transition-all">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                        Order #{order.id.split('-')[0]}
                      </span>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-black group-hover:underline cursor-pointer">
                      {order.product_name}
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Ordered on {new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  
                  <div className="sm:text-right flex flex-col sm:items-end gap-3">
                    <div>
                      <div className="text-2xl font-black text-black">
                        Rs. {order.total_amount}
                      </div>
                      <p className="text-xs text-zinc-500 font-medium">
                        {order.quantity} {order.quantity === 1 ? 'item' : 'items'}
                      </p>
                    </div>

                    {order.status.toLowerCase() === "pending" && (
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => openEditModal(order)}
                          className="text-[10px] font-black uppercase tracking-widest text-black border-b-2 border-black/10 hover:border-black transition-all"
                        >
                          Change Qty
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm("Are you sure you want to cancel this order?")) {
                              deleteOrderMutation.mutate(order.id);
                            }
                          }}
                          className="text-[10px] font-black uppercase tracking-widest text-red-500 border-b-2 border-red-100 hover:border-red-500 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Global Pagination */}
        {orders.length > 0 && !editingOrder && (
          <div className="mt-12 flex items-center justify-between border-t border-black/5 pt-8">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="text-xs font-black uppercase tracking-widest text-black disabled:opacity-30"
            >
              ← Previous
            </button>
            <span className="text-xs font-bold text-zinc-400">Page {page}</span>
            <button 
              disabled={orders.length < LIMIT}
              onClick={() => setPage(p => p + 1)}
              className="text-xs font-black uppercase tracking-widest text-black disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Edit Quantity Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-black tracking-tighter text-black uppercase">Change Quantity</h2>
              <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest font-bold">Adjusting "{editingOrder.product_name}"</p>
            </div>

            <div className="flex flex-col items-center space-y-4">
               <div className="flex items-center border-2 border-black rounded-2xl overflow-hidden h-16 w-full">
                  <button 
                    onClick={() => setNewQuantity(q => Math.max(1, q - 1))}
                    className="flex-1 h-full hover:bg-zinc-50 transition-colors font-bold text-2xl"
                  >
                    -
                  </button>
                  <span className="w-16 text-center font-black text-2xl">{newQuantity}</span>
                  <button 
                    onClick={() => setNewQuantity(q => q + 1)}
                    className="flex-1 h-full hover:bg-zinc-50 transition-colors font-bold text-2xl"
                  >
                    +
                  </button>
               </div>
               <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">New total will be calculated on update</p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setEditingOrder(null)}
                className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-all"
              >
                Go Back
              </button>
              <button 
                onClick={handleApplyModification}
                disabled={modifyOrderMutation.isPending}
                className="flex-[2] py-4 bg-black text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-all shadow-xl shadow-black/10"
              >
                {modifyOrderMutation.isPending ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
