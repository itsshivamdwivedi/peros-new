"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

interface Size {
  label: string;
  price: number;
  inStock: boolean;
}

interface Product {
  id: string;
  id1: number;
  name: string;
  description: string;
  images: string[];
  sizes: Size[];
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    try {
      const productsSnap = await getDocs(collection(db, "products"));
      const allProducts: Product[] = productsSnap.docs.map((docSnap) => {
        const data = docSnap.data() as Omit<Product, "id">;
        const fixedImages = (data.images || []).map((img: string) =>
          img.startsWith("/") || img.startsWith("http") ? img : `/${img}`
        );
        return { id: docSnap.id, ...data, images: fixedImages };
      });

      // Deduplicate by stable id1
      const uniqueProducts = allProducts.filter(
        (p, index, self) =>
          index === self.findIndex((q) => q.id1 === p.id1)
      );

      setProducts(uniqueProducts);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleStock = async (productId: string, sizeLabel: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const updatedSizes = product.sizes.map((size) =>
      size.label === sizeLabel ? { ...size, inStock: !size.inStock } : size
    );

    try {
      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, { sizes: updatedSizes });

      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, sizes: updatedSizes } : p))
      );
    } catch (err) {
      console.error("Failed to update stock:", err);
    }
  };

  if (!products.length) return <p className="text-center mt-10">Loading products...</p>;

  return (
    <div className="flex flex-col items-center px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Admin Products</h1>
      <div className="w-full max-w-6xl flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex flex-col items-center border rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white"
          >
            <h2 className="text-2xl font-semibold mb-2 text-center">{product.name}</h2>
            <p className="text-gray-500 text-sm mb-4 text-center">{product.description}</p>

            {/* Images */}
            <div className="flex gap-2 overflow-x-auto mb-4">
              {product.images.map((img, i) => (
                <Image
                  key={i}
                  src={img}
                  width={120}
                  height={120}
                  alt={`${product.name} image ${i + 1}`}
                  className="rounded-md object-contain border"
                />
              ))}
            </div>

            {/* Sizes & Stock */}
            <h3 className="font-semibold mb-2">Sizes & Stock:</h3>
            <div className="flex flex-col gap-2 w-full">
              {product.sizes.map((size) => (
                <div
                  key={size.label}
                  className="flex justify-between items-center bg-gray-100 p-2 rounded hover:bg-gray-200 transition-colors duration-200"
                >
                  <span className="font-medium">
                    {size.label} - ₹{size.price}
                  </span>
                  <button
                    onClick={() => toggleStock(product.id, size.label)}
                    className={`px-3 py-1 rounded font-semibold transition-colors duration-200 ${
                      size.inStock ? "bg-green-600 text-white hover:bg-green-700" : "bg-red-500 text-white hover:bg-red-600"
                    }`}
                  >
                    {size.inStock ? "In Stock" : "Out of Stock"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
