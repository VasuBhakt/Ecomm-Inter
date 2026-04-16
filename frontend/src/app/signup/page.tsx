"use client";

import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import { SignupRequest } from "@/services/auth/schema";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StateStatus } from "@/utils";

export default function SignupPage() {
  const { signupAsync, signupStatus } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupRequest>({
    defaultValues: {
      role: "buyer",
    },
  });

  const onSubmit = async (data: SignupRequest) => {
    setStatus({ type: null, message: null });
    try {
      const response = await signupAsync(data);
      setStatus({ type: "success", message: response.message });
      router.push("/signin");
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Invalid credentials. Please try again.";
      setStatus({ type: "error", message });
    }
  };

  const [status, setStatus] = useState<StateStatus>({
    type: null,
    message: null,
  });

  const isLoading = signupStatus === "pending";

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md bg-white border border-black/10 rounded-lg p-8 space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-black">
            Sign up
          </h1>
          <p className="text-zinc-500 text-sm">
            Create your account to continue
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="username"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
            >
              Username
            </label>
            <input
              id="username"
              {...register("username", { required: "Username is required" })}
              className="w-full px-4 py-2 bg-white border border-zinc-200 rounded focus:border-black outline-none transition-colors text-black"
              placeholder="username"
            />
            {errors.username && (
              <p className="text-xs text-red-600">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label
              htmlFor="email"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Invalid email address",
                },
              })}
              className="w-full px-4 py-2 bg-white border border-zinc-200 rounded focus:border-black outline-none transition-colors text-black"
              placeholder="email@example.com"
            />
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label
              htmlFor="password"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "At least 6 characters",
                },
              })}
              className="w-full px-4 py-2 bg-white border border-zinc-200 rounded focus:border-black outline-none transition-colors text-black"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label
              htmlFor="role"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
            >
              Join as
            </label>
            <select
              id="role"
              {...register("role", { required: "Role is required" })}
              className="w-full px-4 py-2 bg-white border border-zinc-200 rounded focus:border-black outline-none transition-colors text-black appearance-none"
            >
              <option value="buyer">Customer</option>
              <option value="seller">Seller</option>
            </select>
          </div>
          {status.type && (
            <div className="p-3 border rounded-xl text-center text-sm">
              {status.message}
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-black text-white font-medium rounded hover:bg-zinc-800 transition-colors disabled:bg-zinc-400 mt-2"
          >
            {isLoading ? "Signing up..." : "Create Account"}
          </button>
        </form>

        <div className="text-center text-sm pt-2">
          <span className="text-zinc-500">Already have an account? </span>
          <Link
            href="/signin"
            className="font-bold text-black border-b border-black"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
