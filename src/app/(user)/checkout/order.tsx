
"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, onSnapshot, Timestamp } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { jsPDF } from "jspdf";

// import LogoutButton from "@/components/LogoutButton";





const Orders = () => {
  const { user } = useAuth(); 
  const [orders, setOrders] = useState<any[]>([]); // State to store orders
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state
  // const [filteredOrders, setFilteredOrders] = useState<any[]>([]); // State for filtered orders
  // const [searchQuery, setSearchQuery] = useState<string>(""); // Search query

  useEffect(() => {
    if (!user?.uid) {
      setError("No user is logged in.");
      setLoading(false);
      return;
    }

    // Real-time listener for the user's order data
    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          const orders = userData?.orders || [];

          if (orders.length === 0) {
            setError("You have no orders yet.");
          } else {
            const formattedOrders = orders.map((order: any) => ({
              ...order,
              timestamp: order.createdAt instanceof Timestamp
                ? order.createdAt.toDate()
                : new Date(order.createdAt),
            }));

            formattedOrders.sort((a: any, b: any) => b.timestamp - a.timestamp);
            setOrders(formattedOrders);
          }
        } else {
          setError("User data not found.");
        }
        setLoading(false);
      },
      (err) => {
        setError("Error fetching orders.");
        console.error(err);
        setLoading(false);
      }
    );

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, [user]);


 
  

  

  // Function to return a class based on the order status
  const getStatusClass = (status: string) => {
    switch (status) {
      case "Shipped":
        return "text-blue-500";
      case "Out for Delivery":
        return "text-yellow-500";
      case "Delivered":
        return "text-green-500";
      case "Cancelled":
        return "text-red-500";
      case "Delayed":
        return "text-orange-500";
      case "Return Requested":
        return "text-purple-500";
      case "Return Approved":
        return "text-green-700";
      case "Return Cancelled":
        return "text-red-700";
      default:
        return "text-gray-500";
    }
  };

  const handleReturnRequest = async (orderId: string) => {
    try {
      // Update the order status to 'Return Requested' in Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const orders = userData?.orders || [];
        const updatedOrders = orders.map((order: any) => {
          if (order.orderId === orderId) {
            order.status = "Return Requested";  // Mark the order status as 'Return Requested'
          }
          return order;
        });

        await updateDoc(userRef, { orders: updatedOrders });
      }
    } catch (err) {
      console.error("Error requesting return:", err);
    }
  };

  const handleDownloadInvoice = (order: any) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Invoice", 20, 20);

    // Add order details
    doc.setFontSize(12);
    doc.text(`Order ID: ${order.orderId || "N/A"}`, 20, 40);
    doc.text(`Date: ${order.timestamp.toLocaleDateString()}`, 20, 50);
    doc.text(`Status: ${order.status}`, 20, 60);

    // Add product details
    doc.text("Products:", 20, 80);
    order.cart.forEach((product: any, index: number) => {
      doc.text(
        `${index + 1}. ${product.id} - Quantity: ${product.quantity}, Price: ₹${product.price}`,
        20,
        90 + index * 10
      );
    });

    // Add totals
    doc.text(`Subtotal: ${order.subtotal}`, 20, 140);
    doc.text(`Total Savings: ${order.mrpTotal - order.subtotal}`, 20, 150);

    // Save the PDF
    doc.save(`Invoice_${order.orderId}.pdf`);
  };

  // // Admin Approval and Cancellation of Return Request
  // const handleAdminApproval = async (orderId: string, approve: boolean) => {
  //   try {
  //     const userRef = doc(db, "users", user.uid); // Assume admin can approve/cancel for any user
  //     const userSnap = await getDoc(userRef);

  //     if (userSnap.exists()) {
  //       const userData = userSnap.data();
  //       const orders = userData?.orders || [];
  //       const updatedOrders = orders.map((order: any) => {
  //         if (order.orderId === orderId && order.status === "Return Requested") {
  //           order.status = approve ? "Return Approved" : "Return Cancelled";
  //         }
  //         return order;
  //       });

  //       await updateDoc(userRef, { orders: updatedOrders });
  //     }
  //   } catch (err) {
  //     console.error("Error approving/cancelling return:", err);
  //   }
  // };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4  xl:mt-[15vh]">
      




     <div className="flex flex-col gap-0">
      <div  className=" text-3xl font-serif font-bold hover:text-green-400    ">Your Orders</div>
      <div className="border-b-4 w-28 border-green-500 mb-8 "> </div> 
</div>


      
      {error ? (
        <p className="text-red-500 text-lg">{error}</p>
      ) : (
        <div className="space-y-16 mt-[10vh] ">
          


          
          {orders.length === 0 ? (
            <p className="text-3xl font-serif font-bold hover:text-green-400  ">You have no orders yet.</p>
          ) : (
            orders.map((order, index) => {
              const mrpTotal = order.mrpTotal || 0;
              const subtotal = order.subtotal || 0;

            


             

              return (
                <div
                  key={index}
                  className="bg-white shadow-md rounded-lg p-6 border border-gray-200"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                   <span className="font-bold font-serif"> Order ID :</span> {order.orderId || "N/A"}
                  </h3>
                  <h3 className="text-lg  text-gray-800 mb-2 font-semibold">
                  <span className="font-bold font-serif"> Email :</span> {order.address?.email}
                  </h3>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  <span className="font-bold font-serif"> User :</span> {order.userEmail} 
                  </h3>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    <span className="font-bold font-serif"> Phone :</span> {order.address?.phone}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    <span className="font-medium font-serif">Transaction ID :</span>{" "}
                    {order.razorpayPaymentId || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    <span className="font-medium font-serif">Payment Method :</span>{" "}
                    {order.paymentMethod}
                  </p>
                  <p className="text-sm text-green-300 mb-4">
                    <span className="font-medium">Date:</span>{" "}
                    {order.timestamp.toLocaleDateString()} at{" "}
                    {order.timestamp.toLocaleTimeString()}
                   
             
                  </p>
             
                  <p className="text-sm text-gray-600 mb-4">
                    <span className="font-medium">Shipping Address:</span>{" "}
                    {order.address?.address}, {order.address?.state},{" "}
                    {order.address?.pincode}
                  </p>

                  {/* Order Status */}
                  <p
                    className={`text-md font-semibold ${getStatusClass(order.status)}`}
                  >
                    Status: {order.status || "Pending"}
                  </p>

                  {/* Return Request Section */}
                  {order.status === "Delivered" && order.status !== "Return Requested" && (
                    <div className="flex gap-2"><button
                    onClick={() => handleReturnRequest(order.orderId)}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600"
                  >
                    Request Return
                  </button>
                  
                  </div>
                  )}


{order.status === "Delivered" &&(

<button
                      onClick={() => handleDownloadInvoice(order)}
                      className="mt-4 px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600"
                    >
                      Download Invoice
                    </button>
                        )}







                
                 

                  <div>
                    <h4 className="text-md font-semibold text-gray-800 mb-2 mt-2">
                      Products:
                    </h4>
                    <ul className="space-y-2">
                      
                  {Array.isArray(order.cart) &&
  order.cart.map((product: any, productIndex: number) => (
    <li key={productIndex}>{/* Render product properties */}
    <div className="flex flex-row justify-between self-center content-center items-center"><div> <img className="w-20 h-20 object-cover rounded-lg xl:object-cover xl:w-[50wh] xl:h-[20vh]" src={product.image || "Unknown Product"} alt="" /></div>
    <div><span className="font-medium">{product.title || "Unknown Product"}</span></div>
    </div>
    <div className="flex flex-row justify-between self-center content-center items-center"><div>  Quantity:
    (x{product.quantity})</div>
    <div><span className="font-medium">  ₹{product.price} - <span className="text-red-400">₹{product.pricel}</span> </span></div>
    </div>
    
    </li>
  ))}
                     
                    </ul>
                  </div>

                  <div className="flex flex-row justify-between self-center content-center items-center mt-2">
                    <div className="text-md font-semibold text-gray-800 mt-4 font-serif"> Total: </div>
                  <div className="text-md font-semibold text-green-600 mt-2">₹{order.totalPayable} </div></div>
                  <div className="flex flex-row justify-between self-center content-center items-center">
                    <div className="text-md font-semibold text-gray-800 mt-4 font-serif"> Total Savings :</div>
                  <div className="text-md font-semibold text-green-600 mt-2">₹{mrpTotal - subtotal}</div></div>
                 
                </div>
              );
            })
          )}
        </div>



      )}
       
    
    </div>
  );
};

export default Orders;


