"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/lib/firestore/user/read";
import { Badge } from "@nextui-org/react";
import { Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";

export default function HeaderClientButtons() {
  const { user } = useAuth();
  const { data } = useUser({ uid: user?.uid });
  return (
    <div className="flex items-center gap-1">
      {/* <Link href={`/favorites`}>
        {(data?.favorites?.length ?? 0) != 0 && (
          <Badge
            variant="solid"
            size="sm"
            className="text-white bg-red-500 text-[8px]"
            content={data?.favorites?.length ?? 0}
          >
            <button
              title="My Favorites"
              className="h-8 w-8 flex justify-center items-center rounded-full hover:bg-gray-50"
            >
              <Heart size={14} />
            </button>
          </Badge>
        )}
        {(data?.favorites?.length ?? 0) === 0 && (
          <button
            title="My Favorites"
            className="h-8 w-8 flex justify-center items-center rounded-full hover:bg-gray-50"
          >
            <Heart size={14} />
          </button>
        )}
      </Link> */}
      <Link href={`/cart`}>
        {(data?.carts?.length ?? 0) != 0 && (
       <div className="relative">
  <button
    title="My Cart"
    className="h-8 w-8 flex justify-center items-center rounded-full hover:bg-gray-50 relative"
  >
    <ShoppingCart size={28} />
    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white rounded-full text-[12px] flex items-center justify-center z-10">
      {data?.carts?.length ?? 0}
    </div>
  </button>
</div>

        )}
        {(data?.carts?.length ?? 0) === 0 && (
          <button
            title="My Cart"
            className="h-8 w-8 flex justify-center items-center rounded-full hover:bg-gray-50"
          >
            <ShoppingCart size={28} />
          </button>
        )}
      </Link>
    </div>
  );
}