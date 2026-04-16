"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import ProductService from "@/services/product/service";
import ProductCard from "@/components/ProductCard";

const LIMIT = 10;

export default function Home() {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["products-infinite"],
    queryFn: ({ pageParam = 1 }) =>
      ProductService.getProducts(pageParam, LIMIT),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // If the last page has fewer items than our limit, we've reached the end
      const lastPageData = lastPage?.data || [];
      return lastPageData.length === LIMIT ? allPages.length + 1 : undefined;
    },
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allProducts = data?.pages.flatMap((page) => page.data || []) || [];

  return (
    <div className="bg-white min-h-full pb-20">
      {/* Hero Section */}
      <section className="py-24 px-4 text-center border-b border-black/5">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-black mb-6">
          THE COLLECTION.
        </h1>
        <p className="text-zinc-500 max-w-xl mx-auto text-lg font-medium">
          Premium essentials for the modern lifestyle. <br />
          Curated for quality, designed for longevity.
        </p>
      </section>

      {/* Product Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-xs font-black text-black uppercase tracking-[0.3em] border-l-4 border-black pl-4">
            New Arrivals
          </h2>
          <span className="text-sm font-bold text-zinc-400">
            {allProducts.length} Items Listed
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="aspect-square bg-zinc-50 rounded-2xl" />
                <div className="h-4 bg-zinc-50 rounded w-2/3" />
                <div className="h-4 bg-zinc-50 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-32 border-2 border-dashed border-zinc-100 rounded-3xl">
            <p className="text-zinc-400 font-medium">
              Unable to connect to service.
            </p>
          </div>
        ) : allProducts.length === 0 ? (
          <div className="text-center py-32 border-2 border-dashed border-zinc-100 rounded-3xl">
            <p className="text-zinc-400 text-lg font-semibold">
              Our inventory is currently empty.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
              {allProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Infinite Scroll Sentinel */}
            <div ref={sentinelRef} className="mt-20 flex justify-center py-8">
              {isFetchingNextPage ? (
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-black rounded-full animate-bounce" />
                </div>
              ) : !hasNextPage && allProducts.length > 0 ? (
                <p className="text-xs font-black text-zinc-300 uppercase tracking-widest">
                  End of Collection
                </p>
              ) : null}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
