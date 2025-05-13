import React from 'react'



type Size = {
  label: string;
  price: number;
  pricel: number;
};

type Variant = {
  id: string;
  name: string;
  images: string[];
  description: string;
  sizes: Size[];
  detailedDescription: string;
  detailedDescription2: string;
  detailedDescription3: string;
  shelfLife: string;
};

type ProductCardProps = {
  variant: Variant;
};


const ProductCard: React.FC<ProductCardProps> = ({ variant }) => {
 const mainImage = variant.images[0];
  const firstSize = variant.sizes[0];
  const discount = firstSize.pricel - firstSize.price;
  const discountPercent = Math.round((discount / firstSize.pricel) * 100);

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 max-w-sm w-full hover:shadow-xl transition">
      <img
        src={mainImage}
        alt={variant.name}
        className="w-full h-64 object-contain rounded-xl"
      />
      <h2 className="text-xl font-semibold mt-4">{variant.name}</h2>
      <p className="text-sm text-gray-600 mt-1">{variant.description}</p>

      <div className="mt-4 flex items-center space-x-2">
        <span className="text-lg font-bold text-green-600">
          ₹{firstSize.price}
        </span>
        <span className="text-sm line-through text-gray-400">
          ₹{firstSize.pricel}
        </span>
        <span className="text-sm text-red-500">({discountPercent}% OFF)</span>
      </div>

      <div className="mt-3">
        <span className="text-sm font-medium text-gray-700">Sizes:</span>
        <div className="flex space-x-2 mt-1">
          {variant.sizes.map((size, index) => (
            <button
              key={index}
              className="px-2 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200 transition"
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductCard