"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, isSignedIn, signoutAsync } = useAuth();
  const router = useRouter();

  const handleSignout = async () => {
    try {
      await signoutAsync();
      router.push("/signin");
    } catch (error) {
      console.error("Signout failed", error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              href="/"
              className="text-xl font-black tracking-tighter text-black"
            >
              ECOMM.
            </Link>
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <div className="flex items-center space-x-6">
                {user?.role === "buyer" ? (
                  <Link
                    href="/orders"
                    className="text-sm font-medium text-zinc-600 hover:text-black transition-colors"
                  >
                    My Orders
                  </Link>
                ) : (
                  <Link
                    href="/products"
                    className="text-sm font-medium text-zinc-600 hover:text-black transition-colors"
                  >
                    My Products
                  </Link>
                )}
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-zinc-900 border-l border-zinc-200 pl-3">
                    {`${user?.username}`}{" "}
                    {user?.role === "seller" && ": Seller"}
                  </span>
                  <button
                    onClick={handleSignout}
                    className="text-sm font-bold text-red-600 hover:opacity-70 transition-all cursor-pointer"
                  >
                    Signout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-6">
                <Link
                  href="/signin"
                  className="text-sm font-medium text-zinc-600 hover:text-black transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2 bg-black text-white text-sm font-bold rounded hover:bg-zinc-800 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
