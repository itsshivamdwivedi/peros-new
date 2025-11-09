"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  collectionGroup,
  deleteDoc,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { useStock } from "@/contexts/StockContext";

interface Order {
  orderId: string;
  userId: string;
  userEmail: string;
  status: string;
  timestamp: Date;
  paymentMethod: string;
  address: any;
  cart: any[];
  mrpTotal: number;
  subtotal: number;
  totalPayable: number;
}

interface Review {
  rating: number;
  comment: string;
  userId: string;
  timestamp?: any;
}

const AdminOrders = () => {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [productsData, setProductsData] = useState<Record<string, any>>({});
  const [reviewsByProduct, setReviewsByProduct] = useState<
    Record<string, { id: string; data: Review }[]>
  >({});
  const { stockByProduct, setStock } = useStock();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ FETCH ORDERS (NOT grouped by email)
  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);

      const usersSnapshot = await getDocs(collection(db, "users"));
    const orders: Order[] = [];

      usersSnapshot.forEach((userDoc) => {
        const userId = userDoc.id;
        const userData = userDoc.data();
        const userOrders = userData.orders || [];

        userOrders.forEach((o: any) => {
          const timestamp =
            o.createdAt instanceof Timestamp
              ? o.createdAt.toDate()
              : new Date(o.createdAt);

          orders.push({
            ...o,
            userId,
            timestamp,
          } as Order);
        });
      });

      // ✅ sort ONLY by timestamp
      orders.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      setAllOrders(orders);

      // ✅ 24-hour filter
      const now = Date.now();
      const last24 = orders.filter(
        (o) => now - o.timestamp.getTime() <= 24 * 60 * 60 * 1000
      );

      setRecentOrders(last24);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Error fetching orders.");
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ✅ REVIEWS
  useEffect(() => {
    fetchAllReviews();
  }, []);

  const fetchAllReviews = async () => {
    try {
      setLoading(true);
      const reviewSnapshots = await getDocs(collectionGroup(db, "reviews"));
      const reviewsMap: Record<string, { id: string; data: Review }[]> = {};

      reviewSnapshots.forEach((docSnap) => {
        const pathSegments = docSnap.ref.path.split("/");
        const productId = pathSegments[1];

        if (!reviewsMap[productId]) {
          reviewsMap[productId] = [];
        }

        reviewsMap[productId].push({
          id: docSnap.id,
          data: docSnap.data() as Review,
        });
      });

      setReviewsByProduct(reviewsMap);
    } catch (err: any) {
      console.error("Error fetching reviews:", err);
      setError("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (productId: string, reviewId: string) => {
    try {
      await deleteDoc(doc(db, "products", productId, "reviews", reviewId));
      fetchAllReviews();
    } catch (err) {
      console.error("Error deleting review:", err);
      setError("Failed to delete review.");
    }
  };


    const updateProductStock = async (
    productId: string,
    sizeLabel: string,
    inStock: boolean
  ) => {
    try {
      const productRef = doc(db, "products", productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        throw new Error("Product not found");
      }

      const productData = productSnap.data();
      const updatedSizes = productData.sizes.map((size: any) =>
        size.label === sizeLabel ? { ...size, inStock } : size
      );

      await updateDoc(productRef, { sizes: updatedSizes });

      setProductsData((prev) => ({
        ...prev,
        [productId]: { ...productData, sizes: updatedSizes },
      }));
    } catch (err) {
      console.error("Error updating stock:", err);
    }
  };


  // ✅ RETURN + DELETE + STATUS
  const handleReturnApproval = async (orderId: string, userId: string) => {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;

    const userData = userSnap.data();
    const orders = userData.orders.map((o: any) =>
      o.orderId === orderId ? { ...o, status: "Return Approved" } : o
    );

    await updateDoc(userRef, { orders });
    fetchOrders();
  };

  const handleReturnCancellation = async (orderId: string, userId: string) => {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;

    const userData = userSnap.data();
    const orders = userData.orders.map((o: any) =>
      o.orderId === orderId ? { ...o, status: "Delivered" } : o
    );

    await updateDoc(userRef, { orders });
    fetchOrders();
  };

  const deleteOrder = async (orderId: string, userId: string) => {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;

    const updated = userSnap.data().orders.filter(
      (o: any) => o.orderId !== orderId
    );

    await updateDoc(userRef, { orders: updated });
    fetchOrders();
  };

  const updateOrderStatus = async (
    orderId: string,
    userId: string,
    status: string
  ) => {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;

    const userData = userSnap.data();
    const updated = userData.orders.map((o: any) =>
      o.orderId === orderId ? { ...o, status } : o
    );

    await updateDoc(userRef, { orders: updated });
    fetchOrders();
  };

  // ✅ RENDERING
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">

      {/* ✅ RECENT ORDERS SECTION */}
      <h2 className="text-2xl font-bold mb-6 font-serif text-gray-800">
        Orders Within Last 24 Hours
      </h2>

      {recentOrders.length === 0 ? (
        <p className="text-gray-600">No recent orders.</p>
      ) : (
        <div className="space-y-6">
          {recentOrders.map((order, index) => (
            <OrderCard
              key={index}
              order={order}
              updateOrderStatus={updateOrderStatus}
              deleteOrder={deleteOrder}
              handleReturnApproval={handleReturnApproval}
              handleReturnCancellation={handleReturnCancellation}
            />
          ))}
        </div>
      )}

      {/* ✅ ALL ORDERS (TIME SORTED) */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6 mt-12 font-serif">
        All Orders 
      </h2>

      {loadingOrders ? (
        <p>Loading...</p>
      ) : allOrders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="space-y-8">
          {allOrders.map((order, index) => (
            <OrderCard
              key={index}
              order={order}
              updateOrderStatus={updateOrderStatus}
              deleteOrder={deleteOrder}
              handleReturnApproval={handleReturnApproval}
              handleReturnCancellation={handleReturnCancellation}
            />
          ))}
        </div>
      )}

      {/* ✅ STOCK + REVIEWS BELOW (UNCHANGED) */}
      {/* -------------------------------------------------------------------- */}

      <div className="max-w-5xl mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold mb-6 font-serif text-gray-800">
          Manage Product Stock
        </h2>

        {Object.keys(productsData).length === 0 ? (
          <p>Loading products...</p>
        ) : (
          Object.entries(productsData).map(([productId, product]) => (
            <div
              key={productId}
              className="mb-4 border border-gray-200 rounded-lg p-4"
            >
              <h3 className="font-semibold mb-2">
                {product.name || productId}
              </h3>

              {product.sizes?.length > 0 ? (
                product.sizes.map((size: any) => (
                  <div
                    key={size.label}
                    className="flex gap-2 items-center mb-1"
                  >
                    <span>
                      {size.label} {size.inStock ? "" : "(Out of Stock)"}
                    </span>

                    <button
                      className={`px-2 py-1 rounded text-white ${
                        size.inStock ? "bg-red-500" : "bg-green-500"
                      }`}
                      onClick={() =>
                        updateProductStock(
                          productId,
                          size.label,
                          !size.inStock
                        )
                      }
                    >
                      {size.inStock
                        ? "Mark Out of Stock"
                        : "Mark In Stock"}
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">
                  No sizes available for this product
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* ✅ REVIEWS SECTION UNCHANGED */}
      <h2 className="text-2xl font-bold mb-6 font-serif text-gray-800">
        All Product Reviews
      </h2>

      {loading ? (
        <p>Loading reviews...</p>
      ) : Object.keys(reviewsByProduct).length === 0 ? (
        <p>No reviews found.</p>
      ) : (
        Object.entries(reviewsByProduct).map(([productId, reviews]) => (
          <div
            key={productId}
            className="mb-8 border border-gray-200 rounded-lg shadow-sm p-6 bg-white"
          >
            <h3 className="text-xl font-semibold font-serif text-gray-700 mb-4">
              Product ID: <span className="font-mono">{productId}</span>
            </h3>

            {reviews.map((review) => (
              <div
                key={review.id}
                className="border-b border-gray-100 py-3 flex justify-between items-start"
              >
                <div>
                  <p className="text-gray-800">
                    <strong>User ID:</strong> {review.data.userId}
                  </p>
                  <p className="text-gray-600">
                    <strong>Rating:</strong> {review.data.rating} ⭐
                  </p>
                  <p className="text-gray-600">
                    <strong>Comment:</strong> {review.data.comment}
                  </p>
                </div>

                <button
                  onClick={() => deleteReview(productId, review.id)}
                  className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

// ✅ Order Card (your UI preserved EXACTLY)
const OrderCard = ({
  order,
  updateOrderStatus,
  deleteOrder,
  handleReturnApproval,
  handleReturnCancellation,
}: any) => (
  <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-300">
    <h4 className="text-md font-medium text-gray-700 mb-2 font-serif">
      Order ID: <span className="font-sans">{order.orderId}</span>
    </h4>

    <p className="text-sm text-gray-600 mb-2">
      <span className="font-medium font-serif">Email:</span>{" "}
      {order.address?.email}
    </p>

    <p className="text-sm text-green-300 mb-4">
      <span className="font-medium">Date:</span>{" "}
      {order.timestamp.toLocaleDateString()} at{" "}
      {order.timestamp.toLocaleTimeString()}
    </p>

    <p className="text-sm text-gray-600 mb-2">
      <span className="font-medium font-serif">Payment Method:</span>{" "}
      {order.paymentMethod}
    </p>

    <p className="text-sm text-gray-600 mb-2">
      <span className="font-medium font-serif">Gross Total:</span>{" "}
      {order.mrpTotal}
    </p>

    <p className="text-sm text-gray-600 mb-2">
      <span className="font-medium font-serif">Total Payable:</span>{" "}
      {order.totalPayable}
    </p>

    <div className="text-sm text-gray-600 mb-2">
      {order.cart.map((product: any, index: number) => (
        <li key={index}>
          <div className="flex justify-between items-center">
            <img
              className="w-20 h-20 object-cover rounded-lg"
              src={product.image}
              alt=""
            />
            <span className="font-medium">{product.title}</span>
          </div>

          <div className="flex justify-between items-center">
            <div>Quantity: (x{product.quantity})</div>
            <div>
              ₹{product.price} –{" "}
              <span className="text-red-400">₹{product.pricel}</span>
            </div>
          </div>
        </li>
      ))}
    </div>

    <p className="text-sm text-gray-600 mb-2">
      <span className="font-medium font-serif">Status:</span>{" "}
      {order.status}
    </p>

    {order.status === "Return Requested" && (
      <div className="space-x-4">
        <button
          onClick={() => handleReturnApproval(order.orderId, order.userId)}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Approve Return
        </button>

        <button
          onClick={() =>
            handleReturnCancellation(order.orderId, order.userId)
          }
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Cancel Return
        </button>
      </div>
    )}

    <div className="flex flex-col gap-3 mt-4 font-serif">
      <div className="flex justify-between gap-1">
        <button
          onClick={() =>
            updateOrderStatus(order.orderId, order.userId, "Shipped")
          }
          className="bg-blue-500 text-white py-1 px-3 rounded-md"
        >
          Mark as Shipped
        </button>

        <button
          onClick={() =>
            updateOrderStatus(order.orderId, order.userId, "Out for Delivery")
          }
          className="bg-yellow-500 text-white py-1 px-3 rounded-md"
        >
          Out for Delivery
        </button>

        <button
          onClick={() =>
            updateOrderStatus(order.orderId, order.userId, "Delayed")
          }
          className="bg-orange-500 text-white py-1 px-3 rounded-md"
        >
          Delayed
        </button>
      </div>

      <div className="flex justify-between gap-1">
        <button
          onClick={() =>
            updateOrderStatus(order.orderId, order.userId, "Canceled")
          }
          className="bg-red-500 text-white py-1 px-3 rounded-md"
        >
          Canceled
        </button>

        <button
          onClick={() =>
            updateOrderStatus(order.orderId, order.userId, "Delivered")
          }
          className="bg-green-500 text-white py-1 px-3 rounded-md"
        >
          Delivered
        </button>

        <button
          onClick={() => deleteOrder(order.orderId, order.userId)}
          className="bg-red-500 text-white py-1 px-3 rounded-md"
        >
          Delete Order
        </button>
      </div>
    </div>
  </div>
);

export default AdminOrders;


// "use client";

// import { useEffect, useState } from "react";
// import { db } from "@/lib/firebase";
// import {
//   collectionGroup,
//   getDocs,
//   deleteDoc,
//   doc,
// } from "firebase/firestore";

// interface Review {
//   rating: number;
//   comment: string;
//   userId: string;
//   timestamp?: any;
// }

// const AdminReviews = () => {
//   const [reviewsByProduct, setReviewsByProduct] = useState<Record<string, { id: string; data: Review }[]>>({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     fetchAllReviews();
//   }, []);

//   const fetchAllReviews = async () => {
//     try {
//       setLoading(true);
//       const reviewSnapshots = await getDocs(collectionGroup(db, "reviews"));
//       const reviewsMap: Record<string, { id: string; data: Review }[]> = {};

//       reviewSnapshots.forEach((docSnap) => {
//         const pathSegments = docSnap.ref.path.split("/");
//         const productId = pathSegments[1]; // products/{productId}/reviews/{reviewId}

//         if (!reviewsMap[productId]) {
//           reviewsMap[productId] = [];
//         }

//         reviewsMap[productId].push({ id: docSnap.id, data: docSnap.data() as Review });
//       });

//       setReviewsByProduct(reviewsMap);
//     } catch (err: any) {
//       console.error("Error fetching reviews:", err);
//       setError("Failed to load reviews.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const deleteReview = async (productId: string, reviewId: string) => {
//     try {
//       await deleteDoc(doc(db, "products", productId, "reviews", reviewId));
//       fetchAllReviews(); // Refresh UI
//     } catch (err) {
//       console.error("Error deleting review:", err);
//       setError("Failed to delete review.");
//     }
//   };

//   return (
//     <div className="max-w-5xl mx-auto py-8 px-4">
//       <h2 className="text-2xl font-bold mb-6 font-serif text-gray-800">All Product Reviews</h2>
//       {error && <p className="text-red-500 mb-4">{error}</p>}
//       {loading ? (
//         <p>Loading reviews...</p>
//       ) : Object.keys(reviewsByProduct).length === 0 ? (
//         <p>No reviews found.</p>
//       ) : (
//         Object.entries(reviewsByProduct).map(([productId, reviews]) => (
//           <div key={productId} className="mb-8 border border-gray-200 rounded-lg shadow-sm p-6 bg-white">
//             <h3 className="text-xl font-semibold mb-4 font-serif text-gray-700">
//               Product ID: <span className="font-mono">{productId}</span>
//             </h3>
//             {reviews.map((review) => (
//               <div
//                 key={review.id}
//                 className="border-b border-gray-100 py-3 flex justify-between items-start gap-4"
//               >
//                 <div>
//                   <p className="text-gray-800">
//                     <strong>User ID:</strong> {review.data.userId}
//                   </p>
//                   <p className="text-gray-600">
//                     <strong>Rating:</strong> {review.data.rating} ⭐
//                   </p>
//                   <p className="text-gray-600">
//                     <strong>Comment:</strong> {review.data.comment}
//                   </p>
//                 </div>
//                 <button
//                   onClick={() => deleteReview(productId, review.id)}
//                   className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded"
//                 >
//                   Delete
//                 </button>
//               </div>
//             ))}
//           </div>
//         ))
//       )}
//     </div>
//   );
// };

// export default AdminReviews;
