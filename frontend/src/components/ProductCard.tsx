"use client";

import { ProductResponse } from "@/services/product/schema";
import Link from "next/link";

interface ProductCardProps {
  product: ProductResponse;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group bg-white border border-black/5 rounded-xl overflow-hidden hover:border-black/20 transition-all">
      {/* Image Placeholder */}
      <div className="aspect-square bg-zinc-100 flex items-center justify-center p-8 group-hover:bg-zinc-200 transition-colors">
        <span className="text-4xl font-black text-white mix-blend-difference opacity-20 group-hover:opacity-40 select-none">
          {product.name.substring(0, 2).toUpperCase()}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-1">
        <div className="flex justify-between items-start">
          <h3 className="text-sm font-bold text-black line-clamp-1">
            {product.name}
          </h3>
          <span className="text-sm font-black text-black">
            Rs. {product.price}
          </span>
        </div>

        <p className="text-xs text-zinc-500 line-clamp-2 min-h-[2.5rem]">
          {product.description}
        </p>

        <div className="pt-2 flex items-center justify-between">
          <span
            className={`text-[10px] font-bold uppercase tracking-widest ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}
          >
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </span>
        </div>

        <Link
          href={`/product/${product.id}`}
          className="block w-full text-center py-2 mt-2 bg-black text-white text-xs font-bold rounded hover:bg-zinc-800 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
