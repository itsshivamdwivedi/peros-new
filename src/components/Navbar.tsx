"use client";
import { useState } from "react";
import { UserCircle2, Menu, X, Badge, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import AuthContextProvider from "@/contexts/AuthContext";
import HeaderClientButtons from "@/components/HeaderClientButtons";
import LogoutButton from "./LogoutButton";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuList = [
    { name: "Home", link: "/" },
    { name: "Products", link: "/products" },
  ];

  return (
    <>
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-30 bg-white/90 backdrop-blur-md shadow-md">
        <div className="flex justify-between items-center px-4 md:px-6 py-2 md:py-4 font-semibold">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/assets/logo/logo.png"
                alt="Peros Logo"
                priority
                width={100}
                height={70}
                className="md:w-[190px] md:h-[150px]"
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {menuList.map((item, index) => (
              <Link
                key={index}
                href={item.link}
                className="text-black hover:text-[#D9F99D] transition"
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/products"
              className="bg-black text-white px-4 py-2 rounded-md hover:bg-green-300 transition"
            >
              Buy
            </Link>
          </div>

          {/* Icons (logout removed for mobile menu) */}
          <div className="flex items-center space-x-4 md:space-x-6">
            <AuthContextProvider>
              <HeaderClientButtons />
            </AuthContextProvider>

            {/* Account Icon */}
            <Link href="/account">
              <button
                title="My Account"
                className="flex justify-center items-center h-6 w-6 md:h-8 md:w-8"
              >
                <UserCircle2 size={22} />
              </button>
            </Link>
           

            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-1 rounded-full hover:bg-gray-200 hover:text-[#D9F99D] transition"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Push down page content so it's not behind fixed navbar */}
      <div className="mt-[70px] md:mt-[90px]" />

      {/* OVERLAY + SIDEBAR (Shown only if mobileMenuOpen) */}
      {mobileMenuOpen && (
        <>
          {/* Semi-Transparent Overlay (covers entire screen, above navbar) */}
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-In Sidebar (right-aligned) */}
          <div
            className={`fixed top-0 right-0 h-screen w-64 bg-black text-white z-50 
              transform ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}
              transition-transform duration-300 ease-in-out`}
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <span className="text-lg font-semibold">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-white"
              >
                <X size={24} />
              </button>
            </div>

            {/* Sidebar Links */}
            <div className="flex flex-col items-center space-y-6 py-6">
              {menuList.map((item, index) => (
                <Link
                  key={index}
                  href={item.link}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white hover:text-[#D9F99D] transition text-lg"
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="bg-[#D9F99D] text-black px-6 py-2 rounded-md hover:bg-green-300 transition"
              >
                Buy
              </Link>

              {/* Logout Button inside the sidebar */}
              <AuthContextProvider>
                <LogoutButton />
              </AuthContextProvider>
            </div>
            
          </div>
        </>
      )}
    </>
  );
}
