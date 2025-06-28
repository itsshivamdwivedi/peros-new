"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, collectionGroup, deleteDoc, getDoc } from "firebase/firestore";


interface Order {
  orderId: string;
  userEmail: string;
  status: string;
  timestamp: any;
  paymentMethod: string;
  address: any;
  // other order fields...
}


interface Review {
  rating: number;
  comment: string;
  userId: string;
  timestamp?: any;
}

interface UserData {
  email: string;
  orders: Order[];
}

const AdminOrders = () => {
  const [ordersByUser, setOrdersByUser] = useState<any>({}); // Grouped orders by userId
 // Error state
const [loadingOrders, setLoadingOrders] = useState(true);
const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const usersSnapshot = await getDocs(collection(db, "users"));
      const groupedOrders: Record<string, UserData> = {};  // This will ensure 'userId' is a string and maps to UserData

      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        const userEmail = userData?.orders?.[0]?.userEmail || "Email not provided";

        groupedOrders[doc.id] = {
          email: userEmail,
          orders: userData?.orders || [],
        };
      });

      setOrdersByUser(groupedOrders);
    } catch (err) {
      setError("Error fetching orders.");
    } finally {
      setLoading(false);
    }
  };




    const [reviewsByProduct, setReviewsByProduct] = useState<Record<string, { id: string; data: Review }[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const productId = pathSegments[1]; // products/{productId}/reviews/{reviewId}

        if (!reviewsMap[productId]) {
          reviewsMap[productId] = [];
        }

        reviewsMap[productId].push({ id: docSnap.id, data: docSnap.data() as Review });
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
      fetchAllReviews(); // Refresh UI
    } catch (err) {
      console.error("Error deleting review:", err);
      setError("Failed to delete review.");
    }
  };

  const handleReturnApproval = async (orderId: string, userId: string) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const orders = userData?.orders || [];
        const updatedOrders = orders.map((order: any) => {
          if (order.orderId === orderId) {
            order.status = "Return Approved";  // Mark the order status as 'Return Approved'
          }
          return order;
        });

        await updateDoc(userRef, { orders: updatedOrders });
        fetchAllOrders(); // Re-fetch the orders to reflect changes
      }
    } catch (err) {
      console.error("Error approving return:", err);
    }
  };

  const handleReturnCancellation = async (orderId: string, userId: string) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const orders = userData?.orders || [];
        const updatedOrders = orders.map((order: any) => {
          if (order.orderId === orderId) {
            order.status = "Delivered";  // Reset status to Delivered or the original status
          }
          return order;
        });

        await updateDoc(userRef, { orders: updatedOrders });
        fetchAllOrders(); // Re-fetch the orders to reflect changes
      }
    } catch (err) {
      console.error("Error canceling return:", err);
    }
  };


  const deleteOrder = async (orderId: string, userId: string) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error("User not found.");
      }

      const userData = userSnap.data();
      const userOrders = userData?.orders || [];

      const updatedOrders = userOrders.filter((order: any) => order.orderId !== orderId);

      await updateDoc(userRef, { orders: updatedOrders });

      fetchAllOrders(); // Re-fetch the orders to reflect changes
    } catch (err: any) {
      setError(err.message || "Error deleting order.");
    }
  };


  

  const updateOrderStatus = async (orderId: string, userId: string, newStatus: string) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error("User not found.");
      }

      const userData = userSnap.data();
      const userOrders = userData?.orders || [];

      // Find and update the specific order
      const orderIndex = userOrders.findIndex((order: any) => order.orderId === orderId);
      if (orderIndex === -1) {
        throw new Error("Order not found.");
      }

      userOrders[orderIndex].status = newStatus;

      // Update Firestore with the modified orders array
      await updateDoc(userRef, { orders: userOrders });

      // Refetch all orders to update UI
      fetchAllOrders();
    } catch (err: any) {
      setError(err.message || "Error updating order status.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 font-serif">All Orders</h2>
      {error && <p className="text-red-500 text-lg">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-8">
          {Object.keys(ordersByUser).length === 0 ? (
            <p className="text-gray-700">No orders found.</p>
          ) : (
            Object.entries(ordersByUser).map(([userId, userData]: any) => (
              <div key={userId} className="bg-gray-50 shadow-md rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 font-serif">
                  User: {userData.email}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  <span className="font-medium font-serif">User ID:</span> {userId}
                </p>

                <div className="space-y-4">
                  {userData.orders.map((order: any, index: number) => (
                    <div
                      key={index}
                      className="bg-white shadow-sm rounded-lg p-4 border border-gray-300"
                    >
                      <h4 className="text-md font-medium text-gray-700 mb-2 font-serif">
                        Order ID: <span className="font-sans">{order.orderId || "N/A"}</span>
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium font-serif" > Email:</span> {order.address?.email}
                      </p>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium font-serif">Payment Method:</span> {order.paymentMethod || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium font-serif">Gross Total :</span> {order.mrpTotal|| "N/A"}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium font-serif">Net Total :</span> {order.subtotal|| "N/A"}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Date:</span>{" "}
                        {order.timestamp?.toLocaleDateString()} at{" "}
                        {order.timestamp?.toLocaleTimeString()}
                      
                        
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium font-serif">Status:</span> {order.status || "Pending"}
                      </p>

                      {/* Return Handling - Only show if status is "Return Requested" */}
                      {order.status === "Return Requested" && (
                        <div className="space-x-4">
                          <button
                            onClick={() => handleReturnApproval(order.orderId, userId)}
                            className="px-4 py-2 bg-green-500 text-white rounded"
                          >
                            Approve Return
                          </button>
                          <button
                            onClick={() => handleReturnCancellation(order.orderId, userId)}
                            className="px-4 py-2 bg-red-500 text-white rounded ml-2"
                          >
                            Cancel Return
                          </button>
                        </div>
                      )}

                      {/* Status Change and Delete */}
                      <div className="flex  gap-3 mt-4 flex-col  font-serif">
                       <div className="flex justify-between gap-1"> <button
                          onClick={() => updateOrderStatus(order.orderId, userId, "Shipped")}
                          className="bg-blue-500 text-white py-1 px-3 rounded-md"
                        >
                          Mark as Shipped
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.orderId, userId, "Out for Delivery")}
                          className="bg-yellow-500 text-white py-1 px-3 rounded-md"
                        >
                          Out for Delivery
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.orderId, userId, "Delayed")}
                          className="bg-orange-500 text-white py-1 px-3 rounded-md"
                        >
                          Mark as Delayed
                        </button></div>
                        <div className="flex justify-between gap-1">
                        <button
                          onClick={() => updateOrderStatus(order.orderId, userId, "Canceled")}
                          className="bg-red-500 text-white py-1 px-3 rounded-md"
                        >
                          Mark as Canceled
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.orderId, userId, "Delivered")}
                          className="bg-green-500 text-white py-1 px-3 rounded-md"
                        >
                          Mark as Delivered
                        </button>
                        <button
                          onClick={() => deleteOrder(order.orderId, userId)}
                          className="bg-red-500 text-white py-1 px-3 rounded-md"
                        >
                          Delete Order
                        </button>
                        </div>
                        
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
       <div className="max-w-5xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-6 font-serif text-gray-800">All Product Reviews</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading ? (
        <p>Loading reviews...</p>
      ) : Object.keys(reviewsByProduct).length === 0 ? (
        <p>No reviews found.</p>
      ) : (
        Object.entries(reviewsByProduct).map(([productId, reviews]) => (
          <div key={productId} className="mb-8 border border-gray-200 rounded-lg shadow-sm p-6 bg-white">
            <h3 className="text-xl font-semibold mb-4 font-serif text-gray-700">
              Product ID: <span className="font-mono">{productId}</span>
            </h3>
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border-b border-gray-100 py-3 flex justify-between items-start gap-4"
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
    </div>
  );
};

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
