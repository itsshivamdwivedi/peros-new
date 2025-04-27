"use client";

import AuthContextProvider, { useAuth } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { CircularProgress } from "@nextui-org/react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Layout({ children }) {
  return (
    <AuthContextProvider>
      <CartProvider>
        {/* Ensure the layout takes full height */}
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <UserChecking>{children}</UserChecking>
        </div>
      </CartProvider>
    </AuthContextProvider>
  );
}

function UserChecking({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <CircularProgress />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 flex flex-col gap-3 justify-center items-center">
        <h1 className="text-sm text-gray-600">You are not logged in!</h1>
        <Link href="/login">
          <button className="text-white bg-blue-500 px-4 py-2 text-sm rounded-xl">
            Login
          </button>
        </Link>
      </div>
    );
  }

  return <main className="flex-1">{children}</main>;
}
