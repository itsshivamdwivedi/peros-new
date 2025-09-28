import { useStock } from "@/contexts/StockContext";

type AdminStockButtonProps = {
  productId: string; // 👈 explicitly type your prop
};

export default function AdminStockButton({ productId }: AdminStockButtonProps) {
  const { setStock } = useStock();

  return (
    <div className="space-x-2">
      <button
        onClick={() => setStock(productId, false)}
        className="bg-red-500 text-white px-3 py-1 rounded"
      >
        Mark Out of Stock
      </button>
      <button
        onClick={() => setStock(productId, true)}
        className="bg-green-500 text-white px-3 py-1 rounded"
      >
        Mark In Stock
      </button>
    </div>
  );
}
