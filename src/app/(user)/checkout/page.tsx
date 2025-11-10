// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import { useCart } from "@/contexts/CartContext";
// import { gsap } from "gsap";
// import { db } from "@/lib/firebase"; // Assuming you've already exported db from firebaseConfig.jsx

// import Router from "next/router";
// import { useAuth } from "@/contexts/AuthContext";
// import { Timestamp } from "firebase/firestore";
// import Pric from "../../../components/pric";
// import { doc, setDoc, arrayUnion } from "firebase/firestore";
// import Link from "next/link";
// import { useSearchParams } from "next/navigation";

// type AddressDetails = {
//   firstName: string;
//   lastName: string;
//   phone: string;
//   email: string;
//   address: string;
//   state: string;
//   pincode: string;
//   [key: string]: string;
// };

// interface CartItem {
//   id: string;
//   name: string;
//   price: number;
//   quantity: number;
//   image: string;
//   size: string;
//   pricel: number;
// }

// type PaymentStatus = "Order Created" | "FAILED" | "PENDING" | "UNKNOWN";
// type PaymentDetails = {
//   orderId: string;
//   paymentMethod: "COD" | "PhonePe"; // specify the possible values for paymentMethod
//   razorpayPaymentId?: string; // razorpayPaymentId is optional
//   address: AddressDetails;
//   cart: CartItem[];
//   subtotal: number;
//   mrpTotal: number;
//   userEmail: string;
//   status: PaymentStatus;
// };

// declare global {
//   interface Window {
//     PhonePe: any;
//   }
// }

// const Checkout = () => {
//   const { cart, removeFromCart } = useCart();
//   const [isProcessing, setIsProcessing] = useState(false);
//   const router = Router;
//   const { user } = useAuth();

//   const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
//   const [agreed, setAgreed] = useState(false);
//   const [showFormPopup, setShowFormPopup] = useState(false); // Popup for form warning
//   const [showPopup, setShowPopup] = useState(false); // Payment success popup
//   const [paymentDetails, setPaymentDetails] = useState<any>(null);
//   const [paymentMethod, setPaymentMethod] = useState<"COD" | "PhonePe">(
//     "PhonePe"
//   ); // Added payment method

//   const COD_HANDLING_CHARGE = 10;
// const DELIVERY_CHARGE = 40;

//   const [address, setAddress] = useState<AddressDetails>({
//     firstName: "",
//     lastName: "",
//     phone: "",
//     email: "",
//     address: "",
//     state: "",
//     pincode: "",
//   });

//   const [showNameError, setShowNameError] = useState(false); // State for name error
//   const [showPhoneError, setShowPhoneError] = useState(false); // State for phone error
//   const [showEmailError, setShowEmailError] = useState(false); // State for email error
//   const [showPincodeError, setShowPincodeError] = useState(false);
//   const [showCartEmptyError, setShowCartEmptyError] = useState(false);

//   const searchParams = useSearchParams();

//   const validateName = (name: string): boolean => {
//     const nameRegex = /^[a-zA-Z\s]+$/; // Regex for only letters and spaces
//     return nameRegex.test(name);
//   };

//   const validateEmail = (email: string): boolean => {
//     const emailRegex = /\S+@\S+\.\S+/; // Basic email regex
//     return emailRegex.test(email);
//   };

//   const validatePincode = (pincode: string): boolean => {
//     const pincodeRegex = /^\d{6}$/; // Regex for 6-digit pincode
//     return pincodeRegex.test(pincode);
//   };

//   useEffect(() => {
//     document.documentElement.style.height = "auto";
//     document.body.style.height = "auto";
//     document.documentElement.scrollTop = 0;
//     document.body.scrollTop = 0;

//     document.body.style.overflow = "auto";
//   }, []);

//   useEffect(() => {
//     if (!user) {
//       router.push("/login"); // Redirect to login page if user is not logged in
//     }
//   }, [user, router]);

//   const hasVerified = useRef(false);

//   useEffect(() => {
//     const verifyFromLocalStorage = async () => {
//       if (hasVerified.current) return;

//       const savedData = localStorage.getItem("checkoutData");
//       if (!savedData) return;

//      const { transactionId, phonePeOrderId, address, cart, subtotal, mrpTotal, userEmail } = JSON.parse(savedData);

     

//       if (!transactionId) return;
//       hasVerified.current = true;
// try {
//   const verifyRes = await fetch(`/api/verify-payment?transactionId=${transactionId}`);
//   const result = await verifyRes.json();

  
//   const paymentStatus = result?.data?.state || "UNKNOWN";
  

//   const basePaymentDetails: PaymentDetails = {
//     orderId: transactionId,
//     paymentMethod: "PhonePe",
//     razorpayPaymentId: transactionId,
//     address,
//     cart,
//     subtotal,
//     mrpTotal,
//     userEmail,
//     status: paymentStatus,
//   };

//   let updatedPaymentDetails: PaymentDetails;

//   if (paymentStatus === "Order Created") {
//     updatedPaymentDetails = {
//       ...basePaymentDetails,
//       status: "Order Created",
//     };
//     await storePaymentDetails(updatedPaymentDetails);
//   } else if (paymentStatus === "FAILED") {
//     updatedPaymentDetails = { ...basePaymentDetails, status: "FAILED" };
//   } else {
//     updatedPaymentDetails = { ...basePaymentDetails, status: "PENDING" };
//   }

//   setPaymentDetails(updatedPaymentDetails);
//   setShowPopup(true);
//   localStorage.removeItem("checkoutData"); // ✅ Clear after showing popup
// } catch (error) {
//   console.error("❌ Error verifying payment:", error);
//   setPaymentDetails({
//     orderId: "",
//     paymentMethod: "PhonePe",
//     address: {
//       firstName: "",
//       lastName: "",
//       phone: "",
//       email: "",
//       address: "",
//       state: "",
//       pincode: "",
//     },
//     cart: [],
//     subtotal: 0,
//     mrpTotal: 0,
//     userEmail: "",
//     status: "FAILED",
//   });
//   setShowPopup(true);
//   localStorage.removeItem("checkoutData"); // ✅ Also clear on catch
// }
//     }
//     verifyFromLocalStorage();
//   }, []);

//   useEffect(() => {
//     if (
//       showPopup &&
//       paymentDetails?.status !== "FAILED" &&
//       paymentDetails?.status !== "PENDING"
//     ) {
//       const createShipment = async () => {
//         try {
//           await fetch("/api/create-shipment", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               address: paymentDetails.address,
//               cart: paymentDetails.cart,
//               orderId: paymentDetails.orderId,
//             }),
//           });
//         } catch (error) {
//           console.error("❌ Error creating shipment:", error);
//         }
//       };

//       createShipment();
//     }
//   }, [showPopup, paymentDetails]);

//   const [isCartOpen, setIsCartOpen] = useState(false); // For showing/hiding cart detailsh

//   const checkoutRef = useRef<HTMLDivElement | null>(null);
//   const formRef = useRef<HTMLDivElement | null>(null); // Reference for form animation

//   // Calculate subtotal
//   const subtotal = cart.reduce(
//     (total: number, item: any) => total + item.price * item.quantity,
//     0
//   );
//   const mrpTotal = cart.reduce(
//     (total: number, item: any) => total + item.pricel * item.quantity,
//     0
//   );

//   useEffect(() => {
//     // Load Razorpay SDK
//     const script = document.createElement("script");
//     script.src = "https://checkout.razorpay.com/v1/checkout.js";
//     script.async = true;
//     script.onload = () => setIsRazorpayLoaded(true);
//     script.onerror = () => console.error("Failed to load Razorpay SDK");
//     document.body.appendChild(script);

//     // GSAP animation for checkout section
//     gsap.fromTo(
//       checkoutRef.current,
//       { opacity: 0, y: 50 },
//       { opacity: 1, y: 0, duration: 1 }
//     );

//     // Form animation (fade-in and slide-up)
//     gsap.fromTo(
//       formRef.current,
//       { opacity: 0, y: 30 },
//       { opacity: 1, y: 0, duration: 1, stagger: 0.1 }
//     );
//   }, []);

//   function validatePhone(phone: string): boolean {
//     const phoneRegex = /^[789]\d{9}$/;
//     return phoneRegex.test(phone);
//   }

//   const generateOrderId = () => {
//     const timestamp = Date.now();
//     const randomStr = Math.random().toString(36).substring(2, 10);
//     return `ORD-${timestamp}-${randomStr}`;
//   };

//   const storePaymentDetails = async (paymentDetails: PaymentDetails) => {
//     if (
//       !paymentDetails.orderId ||
//       !paymentDetails.paymentMethod ||
//       !paymentDetails.address ||
//       !paymentDetails.cart ||
//       !paymentDetails.subtotal ||
//       !paymentDetails.mrpTotal
//     ) {
//       console.error("Incomplete payment details:", paymentDetails);
//       return;
//     }

//     try {
//       const userRef = doc(db, `users/${user.uid}`);

//       await setDoc(
//         userRef,
//         {
//           orders: arrayUnion({
//             ...paymentDetails,
//             createdAt: Timestamp.now(),
//           }),
//           cart: [],
//         },
//         { merge: true }
//       );

//       setPaymentDetails(paymentDetails);
//       setShowPopup(true);
//     } catch (error) {
//       console.error("Error storing payment details:", error);
//     }
//   };
//   const handlePayment = async () => {
//     if (cart.length === 0) {
//       setShowCartEmptyError(true);
//       return;
//     }

//     if (
//       !address.firstName ||
//       !address.lastName ||
//       !address.phone ||
//       !address.email ||
//       !address.address ||
//       !address.state ||
//       !address.pincode
//     ) {
//       setShowFormPopup(true);
//       return;
//     }

//     if (!validateName(address.firstName) || !validateName(address.lastName)) {
//       setShowNameError(true);
//       return;
//     }

//     if (!validatePhone(address.phone)) {
//       setShowPhoneError(true);
//       return;
//     }

//     if (!validateEmail(address.email)) {
//       setShowEmailError(true);
//       return;
//     }

//     if (!validatePincode(address.pincode)) {
//       setShowPincodeError(true);
//       return;
//     }

//     setIsProcessing(true);

//     try {
//       const orderId = generateOrderId(); // Single generation for both methods

//       if (paymentMethod === "PhonePe") {
//         const orderId = generateOrderId();

// const res = await fetch("/api/create-order", {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({
//     amount: subtotal * 100, // in paise
//     orderId,
//     metaInfo: {
//       udf1: user?.uid || "guest",
//       udf2: "web",
//       udf3: "SUMMER25",
//       udf4: "affiliate_xyz",
//       udf5: `Order ${orderId} for ${user?.email}`,
     
//     },
//   }),
// });
//  console.log(`${orderId}`)

//         if (!res.ok) throw new Error("Failed to create PhonePe order");

//         const data = await res.json();
//         const phonepeRedirect = data?.url;
//         const transactionId = data?.transactionId;
//         const phonePeOrderId = data?.phonePeOrderId;

//         if (!phonepeRedirect || !transactionId) {
//           throw new Error("Missing PhonePe redirect URL or transactionId");
//         }

//         // Save correct data to localStorage
//         localStorage.setItem(
//           "checkoutData",
//           JSON.stringify({
//             transactionId, // save correct ID for verification
//             address,
//              phonePeOrderId, 
//             cart,
//             subtotal,
//             mrpTotal,
//             userEmail: user.email,
//           })
//         );

//         window.location.href = phonepeRedirect;
//       } else {
//         // COD fallback: proceed immediately
//         const paymentDetails: PaymentDetails = {
//           orderId,
//           paymentMethod: "COD",
//           razorpayPaymentId: orderId,
//           address,
//           cart,
//           subtotal,
//           mrpTotal,
//           userEmail: user.email,
//           status: "Order Created",
//         };

//         // Create shipment
//         await fetch("/api/create-shipment", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ address, cart, orderId }),
//         });

//         storePaymentDetails(paymentDetails);
//       }
//     } catch (error) {
//       console.error("Payment failed:", error);
//     } finally {
//       setIsProcessing(false);
//     }
//   };
//   const totalAmount = subtotal + mrpTotal; // base total if needed

// const finalAmount =
//   paymentMethod === "COD"
//     ? subtotal + COD_HANDLING_CHARGE + DELIVERY_CHARGE
//     : subtotal; // For PhonePe or others, no extra charges


//   return (
//     <div className="xl:mt-[15vh]">
//       <div ref={checkoutRef} className="p-8">
//         {/* Address Form */}
//         <div ref={formRef} className="mb-8">
//           <h2 className="text-xl font-semibold font-serif mb-4 hover:text-green-400">
//             Shipping Address
//           </h2>
//           <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {/** Floating Input Fields */}
//             {[
//               { name: "firstName", label: "First Name" },
//               { name: "lastName", label: "Last Name" },
//               { name: "phone", label: "Phone Number", type: "phone no" },
//               { name: "email", label: "Email", type: "email" },
//               { name: "address", label: "Address", span: 2 },
//               { name: "state", label: "State" },
//               { name: "pincode", label: "Pincode" },
//             ].map((field, idx) => (
//               <div className="relative" key={field.name || idx}>
//                 <input
//                   type={field.type || "text"}
//                   name={field.name}
//                   value={address[field.name]}
//                   onChange={(e) =>
//                     setAddress({ ...address, [field.name]: e.target.value })
//                   }
//                   required
//                   id={field.name} // Add id to link with label
//                   className="block w-full px-2.5 pb-2.5 font-semibold pt-4 text-sm text-black bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-x-green-400 dark:text-white dark:border-gray-600 dark:focus:border-green-400 peer"
//                   placeholder=" " // Keep placeholder empty to let the label float
//                 />
//                 <label
//                   htmlFor={field.name}
//                   className="absolute text-sm text-green-500 font-semibold dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-green-400 peer-focus:dark:text-green-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1q"
//                 >
//                   {field.label} {/* Field label as per your dynamic data */}
//                 </label>
//               </div>
//             ))}
//           </form>
//         </div>

//         {/* Payment Method Selection */}
//         <div className="mb-8 font-serif font-bold mt-[6vh]">
//           <h2 className="text-xl font-semibold mb-4 hover:text-green-400">
//             Payment Method
//           </h2>
//           <label className="flex items-center">
//             <input
//               type="radio"
//               name="paymentMethod"
//               value="Razorpay"
//               checked={paymentMethod === "PhonePe"}
//               onChange={() => setPaymentMethod("PhonePe")}
//               className="mr-2"
//             />
//             PhonePe
//           </label>
//           <label className="flex items-center mt-4">
//             <input
//               type="radio"
//               name="paymentMethod"
//               value="COD"
//               checked={paymentMethod === "COD"}
//               onChange={() => setPaymentMethod("COD")}
//               className="mr-2"
//             />
//             Cash on Delivery
//           </label>
//           <Pric agreed={agreed} setAgreed={setAgreed} />
//         </div>

//         {/* Order Summary */}
//         <div className="mb-8 mt-[6vh]">
//           <h2 className="text-xl font-semibold mb-4 font-serif hover:text-green-400">
//             Order Summary
//           </h2>
//           <div className="border rounded-md p-4">
//             <div className="flex justify-between mb-2 font-semibold">
//               <span>Subtotal</span>
//               <span>₹{subtotal}</span>
//             </div>

//             {/* Cart Details Dropdown */}
//             <div>
//               <button
//                 onClick={() => setIsCartOpen(!isCartOpen)}
//                 className="bg-gray-200 p-2 rounded-md mt-4 w-full text-left font-semibold"
//               >
//                 {isCartOpen ? "Hide Cart Details" : "Show Cart Details"}
//               </button>

//               {isCartOpen && (
//                 <div className="mt-2">
//                   {cart.map((item: any) => (
//                     <div
//                       key={item.id}
//                       className="flex justify-evenly content-center "
//                     >
//                       <div>
//                         <span>
//                           <img
//                             src={item.image}
//                             className="w-20 h-20 object-cover mr-4 xl:object-center xl:w-[50wh] xl:h-[20vh]   "
//                             alt=""
//                           />{" "}
//                         </span>
//                       </div>
//                       <div className="flex justify-center content-center self-center">
//                         {item.name} x {item.quantity}{" "}
//                       </div>
//                       <div className="flex justify-center content-center self-center">
//                         {" "}
//                         ₹{item.price * item.quantity}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Proceed to Payment Button */}
//         <button
//           onClick={handlePayment}
//           disabled={!agreed || isProcessing}
//           className={`px-4 py-2 rounded-md font-semibold transition-colors duration-300 mt-4 ${
//             !agreed || isProcessing
//               ? "bg-green-200 text-white cursor-not-allowed"
//               : "bg-green-500 text-white hover:bg-orange-500"
//           }`}
//         >
//           {isProcessing ? "Processing..." : "Pay Now"}
//         </button>
//       </div>

//       {showCartEmptyError && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
//           <div className="bg-white p-6 rounded-lg w-80 text-center">
//             <h2 className="text-xl font-semibold text-red-500 mb-4 font-serif ">
//               Cart is Empty
//             </h2>
//             <p className="text-gray-700 font-semibold">
//               Please add some products to your cart before proceeding to
//               payment.
//             </p>
//             <Link href="/products">
//               <button
//                 onClick={() => setShowCartEmptyError(false)} // Close the popup
//                 className="mt-4 px-6 py-2 bg-red-500 text-white rounded-md font-semibold hover:bg-green-400"
//               >
//                 Shop Now
//               </button>
//             </Link>
//           </div>
//         </div>
//       )}

//       {/* Form Incompletion Popup */}
//       {/* Form Incompletion Popup */}
//       {showFormPopup && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white p-6 rounded-md shadow-lg">
//             <h2 className="text-xl font-semibold mb-4 font-serif ">
//               Form Incomplete!
//             </h2>
//             <p>
//               Please fill out the shipping address form before proceeding to
//               payment.
//             </p>
//             <button
//               className="hover:bg-orange-500 bg-green-400 text-white px-4 py-2 rounded-md mt-4 font-semibold"
//               onClick={() => setShowFormPopup(false)}
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}

//       {showNameError && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
//           <div className="bg-white p-6 rounded-lg w-80 text-center">
//             <h2 className="text-xl font-semibold text-red-500 mb-4 font-serif">
//               Invalid Name
//             </h2>
//             <p className="text-gray-700 font-semibold">
//               First Name and Last Name should only contain letters.
//             </p>
//             <button
//               onClick={() => setShowNameError(false)} // Close the error popup
//               className="mt-4 px-6 py-2 bg-red-500 text-white rounded-md font-semibold"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}

//       {showPhoneError && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
//           <div className="bg-white p-6 rounded-lg w-80 text-center">
//             <h2 className="text-xl font-semibold text-red-500 mb-4 font-serif">
//               Invalid Phone Number
//             </h2>
//             <p className="text-gray-700 font-semibold">
//               Please enter a valid 10-digit phone number.
//             </p>
//             <button
//               onClick={() => setShowPhoneError(false)} // Close the error popup
//               className="mt-4 px-6 py-2 bg-red-500 text-white rounded-md font-semibold"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}

//       {showEmailError && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
//           <div className="bg-white p-6 rounded-lg w-80 text-center">
//             <h2 className="text-xl font-semibold text-red-500 mb-4 font-serif">
//               Invalid Email
//             </h2>
//             <p className="text-gray-700 font-semibold">
//               Please enter a valid email address.
//             </p>
//             <button
//               onClick={() => setShowEmailError(false)} // Close the error popup
//               className="mt-4 px-6 py-2 bg-red-500 text-white rounded-md font-semibold"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}

//       {showPincodeError && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
//           <div className="bg-white p-6 rounded-lg w-80 text-center">
//             <h2 className="text-xl font-semibold font-serif text-red-500 mb-4">
//               Invalid Pincode
//             </h2>
//             <p className="text-gray-700 font-semibold">
//               Please enter a valid 6-digit pincode.
//             </p>
//             <button
//               onClick={() => {
//                 setPaymentDetails(null);
//                 setShowPopup(false);
//               }}
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}

//       {showPopup && (
//         <div className="popup">
//           {paymentDetails?.status === "FAILED" && (
//             <div className="fixed inset-0 flex items-center justify-center mt-[5vh] bg-black bg-opacity-50 z-50">
//               <div className="bg-white p-6 rounded-md shadow-lg text-center relative">
//                 <div className="text-lg font-semibold mb-2">
//                   ❌ Payment Failed
//                 </div>
//                 <Link href="/checkout">
//                   <button
//                     className="bg-green-500 hover:bg-orange-400 text-white px-4 py-2 rounded-md mt-4"
//                     onClick={() => {
//                       setPaymentDetails(null);
//                       setShowPopup(false);
//                     }}
//                   >
//                     Close
//                   </button>
//                 </Link>
//               </div>
//             </div>
//           )}

//           {paymentDetails?.status === "PENDING" && (
//             <div className="fixed inset-0 flex items-center justify-center mt-[5vh] bg-black bg-opacity-50 z-50">
//               <div className="bg-white p-6 rounded-md shadow-lg text-center relative">
//                 <div className="text-lg font-semibold mb-2">
//                   ⏳ Payment is Processing...
//                 </div>
//                 <Link href="/checkout">
//                   <button
//                     className="bg-green-500 hover:bg-orange-400 text-white px-4 py-2 rounded-md mt-4"
//                     onClick={() => {
//                       setShowPopup(false);
//                     }}
//                   >
//                     Close
//                   </button>
//                 </Link>
//               </div>
//             </div>
//           )}

//           {paymentDetails?.status === "Order Created" && (
//             <div className=" fixed inset-0 flex items-center justify-center mt-[5vh] bg-black bg-opacity-50">
//               <div className="bg-white p-6 rounded-md shadow-lg">
//                 <h2 className="text-xl font-semibold mb-4 font-serif">
//                   Order Confirmed!
//                 </h2>

//                 <p>
//                   <strong>Order ID:</strong> {paymentDetails.orderId}
//                 </p>
//                 <p>
//                   <strong>Payment Method:</strong>{" "}
//                   {paymentDetails.paymentMethod}
//                 </p>
//                 <p>
//                   <strong>Payment ID:</strong>{" "}
//                   {paymentDetails.razorpayPaymentId}
//                 </p>

//                 <p>
//                   <strong>Shipping Address:</strong>
//                   <br />
//                   {`${paymentDetails.address.firstName} ${paymentDetails.address.lastName}`}
//                   <br />
//                   {paymentDetails.address.address}
//                   <br />
//                   {paymentDetails.address.state},{" "}
//                   {paymentDetails.address.pincode}
//                   <br />
//                   <strong>Email:</strong> {paymentDetails.address.email}
//                   <br />
//                   <strong>Phone:</strong> {paymentDetails.address.phone}
//                 </p>

//                 <h3 className="mt-4 font-semibold">Cart Summary:</h3>
//                 {paymentDetails.cart.map((item: CartItem) => (
//                   <div key={item.id} className="flex justify-between">
//                     <span>
//                       {item.name} x {item.quantity}
//                     </span>
//                     <span>₹{item.price * item.quantity}</span>
//                   </div>
//                 ))}

//                 <div className="flex justify-between font-bold mt-4">
//                   <span>Subtotal</span>
//                   <span>₹{paymentDetails.subtotal}</span>
//                 </div>

//                 <div className="flex justify-between font-bold mt-4">
//                   <span>Savings</span>
//                   <span>
//                     ₹{paymentDetails.mrpTotal - paymentDetails.subtotal}
//                   </span>
//                 </div>

//                 <Link href="/account">
//                   <button
//                     className="bg-green-500 hover:bg-orange-400 text-white px-4 py-2 rounded-md mt-4"
//                     onClick={() => {
//                       paymentDetails.cart.forEach((item: CartItem) =>
//                         removeFromCart(item.id)
//                       );
//                       setShowPopup(false);
//                     }}
//                   >
//                     Close
//                   </button>
//                 </Link>
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Order Confirmation Popup */}
//     </div>
//   );
// };

// export default Checkout;


















"use client";

import React, { useEffect, useRef, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { gsap } from "gsap";
import { db } from "@/lib/firebase"; // Assuming you've already exported db from firebaseConfig.jsx

import Router from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { Timestamp } from "firebase/firestore";
import Pric from "../../../components/pric";
import { doc, setDoc, arrayUnion } from "firebase/firestore";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type AddressDetails = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  state: string;
  pincode: string;
  [key: string]: string;
};

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size: string;
  pricel: number;
}

type PaymentStatus = "Order Created" | "FAILED" | "PENDING" | "UNKNOWN";
type PaymentDetails = {
  orderId: string;
  paymentMethod: "COD" | "PhonePe"; // specify the possible values for paymentMethod
  razorpayPaymentId?: string; // razorpayPaymentId is optional
  address: AddressDetails;
  cart: CartItem[];
  subtotal: number;
  mrpTotal: number;
  userEmail: string;
   waybill?: string | null;
  status: PaymentStatus;
  totalPayable: number;
  extraCharges?: number; // Added extraCharges for COD
  totalAmount?: number;  // Added totalAmount including extra charges
};

declare global {
  interface Window {
    PhonePe: any;
  }
}

const Checkout = () => {
  const { cart, removeFromCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const router = Router;
  const { user } = useAuth();

  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showFormPopup, setShowFormPopup] = useState(false); // Popup for form warning
  const [showPopup, setShowPopup] = useState(false); // Payment success popup
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "PhonePe">(
    "PhonePe"
  ); // Added payment method

  const COD_HANDLING_CHARGE = 10;
  const DELIVERY_CHARGE = 0;

  const [address, setAddress] = useState<AddressDetails>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    state: "",
    pincode: "",
  });

  const [showNameError, setShowNameError] = useState(false); // State for name error
  const [showPhoneError, setShowPhoneError] = useState(false); // State for phone error
  const [showEmailError, setShowEmailError] = useState(false); // State for email error
  const [showPincodeError, setShowPincodeError] = useState(false);
  const [showCartEmptyError, setShowCartEmptyError] = useState(false);

  const searchParams = useSearchParams();

  const validateName = (name: string): boolean => {
    const nameRegex = /^[a-zA-Z\s]+$/; // Regex for only letters and spaces
    return nameRegex.test(name);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /\S+@\S+\.\S+/; // Basic email regex
    return emailRegex.test(email);
  };

  const validatePincode = (pincode: string): boolean => {
    const pincodeRegex = /^\d{6}$/; // Regex for 6-digit pincode
    return pincodeRegex.test(pincode);
  };

  useEffect(() => {
    document.documentElement.style.height = "auto";
    document.body.style.height = "auto";
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    document.body.style.overflow = "auto";
  }, []);

  useEffect(() => {
    if (!user) {
      router.push("/login"); // Redirect to login page if user is not logged in
    }
  }, [user, router]);

  const hasVerified = useRef(false);

  useEffect(() => {
    const verifyFromLocalStorage = async () => {
      if (hasVerified.current) return;

      const savedData = localStorage.getItem("checkoutData");
      if (!savedData) return;

      const { transactionId, phonePeOrderId, address, cart, subtotal, mrpTotal, userEmail } = JSON.parse(savedData);

      if (!transactionId) return;
      hasVerified.current = true;
      try {
        const verifyRes = await fetch("/api/payment-status", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ transactionId }),
})

        const result = await verifyRes.json();

    const code = result?.code;
const state = result?.state;
const success = result?.success;

let paymentStatus: PaymentStatus = "UNKNOWN";

if (code === "PAYMENT_SUCCESS" || state === "COMPLETED" || success === true) {
  paymentStatus = "Order Created";
} else if (code === "PAYMENT_PENDING" || state === "PENDING") {
  paymentStatus = "PENDING";
} else if (
  code === "PAYMENT_ERROR" ||
  code === "PAYMENT_FAILED" ||
  state === "FAILED"
) {
  paymentStatus = "FAILED";

  // k
}



        const basePaymentDetails: PaymentDetails = {
          orderId: transactionId,
          paymentMethod: "PhonePe",
          razorpayPaymentId: transactionId,
          address,
          cart,
          subtotal,
          totalPayable,
          mrpTotal,
          userEmail,
          status: paymentStatus,
        };

        let updatedPaymentDetails: PaymentDetails;

        if (paymentStatus === "Order Created") {
          updatedPaymentDetails = {
            ...basePaymentDetails,
            status: "Order Created",
          };
          await storePaymentDetails(updatedPaymentDetails);
        } else if (paymentStatus === "FAILED") {
          updatedPaymentDetails = { ...basePaymentDetails, status: "FAILED" };
        } else {
          updatedPaymentDetails = { ...basePaymentDetails, status: "PENDING" };
        }

        setPaymentDetails(updatedPaymentDetails);
        setShowPopup(true);
        localStorage.removeItem("checkoutData"); // ✅ Clear after showing popup
      } catch (error) {
        console.error("❌ Error verifying payment:", error);
        setPaymentDetails({
          orderId: "",
          paymentMethod: "PhonePe",
          address: {
            firstName: "",
            lastName: "",
            phone: "",
            email: "",
            address: "",
            state: "",
            pincode: "",
          },
          cart: [],
          subtotal: 0,
          mrpTotal: 0,
          userEmail: "",
          status: "FAILED",
        });
        setShowPopup(true);
        localStorage.removeItem("checkoutData"); // ✅ Also clear on catch
      }
    };
    verifyFromLocalStorage();
  }, []);

  useEffect(() => {
    if (
      showPopup &&
      paymentDetails?.status !== "FAILED" &&
      paymentDetails?.status !== "PENDING"
    ) {
      const createShipment = async () => {
        try {
          await fetch("/api/create-shipment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              address: paymentDetails.address,
              cart: paymentDetails.cart,
              orderId: paymentDetails.orderId,
              paymentMethod: paymentDetails.paymentMethod,
            }),
          });
        } catch (error) {
          console.error("❌ Error creating shipment:", error);
        }
      };

      createShipment();
    }
  }, [showPopup, paymentDetails]);

  const [isCartOpen, setIsCartOpen] = useState(false); // For showing/hiding cart details

  const checkoutRef = useRef<HTMLDivElement | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null); // Reference for form animation

  // Calculate subtotal
  const subtotal = cart.reduce(
    (total: number, item: any) => total + item.price * item.quantity,
    0
  );
  const mrpTotal = cart.reduce(
    (total: number, item: any) => total + item.pricel * item.quantity,
    0
  );

  // Calculate extra charges for COD
  const extraCharges =
  paymentMethod === "COD"
    ? DELIVERY_CHARGE + COD_HANDLING_CHARGE
    : DELIVERY_CHARGE;
  const totalPayable = subtotal + extraCharges;


  const createShipmentAndGetWaybill = async (
  address: any,
  cart: any,
  orderId: any,
  paymentMethod: any
) => {
  try {
    const res = await fetch("/api/create-shipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, cart, orderId, paymentMethod }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      console.error("❌ Shipment failed:", data);
      return null;
    }

    const waybill =
      data.waybill ||
      data.details?.packages?.[0]?.waybill ||
      null;

    console.log("✅ WAYBILL RECEIVED:", waybill);

    return waybill;
  } catch (err) {
    console.error("❌ Shipment Error:", err);
    return null;
  }
};


  useEffect(() => {
    // Load Razorpay SDK
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setIsRazorpayLoaded(true);
    script.onerror = () => console.error("Failed to load Razorpay SDK");
    document.body.appendChild(script);

    // GSAP animation for checkout section
    gsap.fromTo(
      checkoutRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1 }
    );

    // Form animation (fade-in and slide-up)
    gsap.fromTo(
      formRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.1 }
    );
  }, []);

  function validatePhone(phone: string): boolean {
    const phoneRegex = /^[789]\d{9}$/;
    return phoneRegex.test(phone);
  }

  const generateOrderId = () => {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10);
    return `ORD-${timestamp}-${randomStr}`;
  };

 const storePaymentDetails = async (paymentDetails: PaymentDetails) => {
  if (
    !paymentDetails.orderId ||
    !paymentDetails.paymentMethod ||
    !paymentDetails.address ||
    !paymentDetails.cart ||
    !paymentDetails.subtotal ||
    !paymentDetails.mrpTotal
  ) {
    console.error("Incomplete payment details:", paymentDetails);
    return;
  }

  try {
    const userRef = doc(db, `users/${user.uid}`);

    await setDoc(
      userRef,
      {
        orders: arrayUnion({
          ...paymentDetails,
          waybill: paymentDetails.waybill || null, // ✅ save waybill
          extraCharges: paymentMethod === "COD" ? extraCharges : 0,
          totalAmount: paymentMethod === "COD" ? totalPayable : subtotal,
          createdAt: Timestamp.now(),
        }),
        cart: [],
      },
      { merge: true }
    );

    setPaymentDetails(paymentDetails);
    setShowPopup(true);
  } catch (error) {
    console.error("Error storing payment details:", error);
  }
};


  const handlePayment = async () => {
    if (cart.length === 0) {
      setShowCartEmptyError(true);
      return;
    }

    if (
      !address.firstName ||
      !address.lastName ||
      !address.phone ||
      !address.email ||
      !address.address ||
      !address.state ||
      !address.pincode
    ) {
      setShowFormPopup(true);
      return;
    }

    if (!validateName(address.firstName) || !validateName(address.lastName)) {
      setShowNameError(true);
      return;
    }

    if (!validatePhone(address.phone)) {
      setShowPhoneError(true);
      return;
    }

    if (!validateEmail(address.email)) {
      setShowEmailError(true);
      return;
    }

    if (!validatePincode(address.pincode)) {
      setShowPincodeError(true);
      return;
    }

    setIsProcessing(true);

    try {
      const orderId = generateOrderId(); // Single generation for both methods

      if (paymentMethod === "PhonePe") {
        const res = await fetch("/api/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: totalPayable * 100, // in paise
            orderId,
            metaInfo: {
              udf1: user?.uid || "guest",
              udf2: "web",
              udf3: "SUMMER25",
              udf4: "affiliate_xyz",
              udf5: `Order ${orderId} for ${user?.email}`,
            },
          }),
        });

        if (!res.ok) throw new Error("Failed to create PhonePe order");

        const data = await res.json();
        const phonepeRedirect = data?.url;
        const transactionId = data?.transactionId;
        const phonePeOrderId = data?.phonePeOrderId;

        if (!phonepeRedirect || !transactionId) {
          throw new Error("Missing PhonePe redirect URL or transactionId");
        }

        localStorage.setItem(
          "checkoutData",
          JSON.stringify({
            transactionId,
            address,
            phonePeOrderId,
            cart,
            subtotal,
            mrpTotal,
            userEmail: user.email,
          })
        );

        window.location.href = phonepeRedirect;
      } else {
        // COD fallback: proceed immediately
        const paymentDetails: PaymentDetails = {
          orderId,
          paymentMethod: "COD",
          razorpayPaymentId: orderId,
          address,
          cart,
          subtotal,
          totalPayable,
          mrpTotal,
          userEmail: user.email,
          status: "Order Created",
          extraCharges,
          totalAmount: totalPayable,
        };

       // ✅ First create shipment & get waybill
const waybill = await createShipmentAndGetWaybill(address, cart, orderId, "COD");

const paymentDetailsWithWaybill = {
  ...paymentDetails,
  waybill: waybill || null,
};

// Save to Firestore
await storePaymentDetails(paymentDetailsWithWaybill);



      }
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="xl:mt-[15vh]">
      <div ref={checkoutRef} className="p-8">
        {/* Address Form */}
        <div ref={formRef} className="mb-8">
          <h2 className="text-xl font-semibold font-serif mb-4 hover:text-green-400">
            Shipping Address
          </h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: "firstName", label: "First Name" },
              { name: "lastName", label: "Last Name" },
              { name: "phone", label: "Phone Number", type: "phone no" },
              { name: "email", label: "Email", type: "email" },
              { name: "address", label: "Address", span: 2 },
              { name: "state", label: "State" },
              { name: "pincode", label: "Pincode" },
            ].map((field, idx) => (
              <div className="relative" key={field.name || idx}>
                <input
                  type={field.type || "text"}
                  name={field.name}
                  value={address[field.name]}
                  onChange={(e) =>
                    setAddress({ ...address, [field.name]: e.target.value })
                  }
                  required
                  id={field.name}
                  className="block w-full px-2.5 pb-2.5 font-semibold pt-4 text-sm text-black bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-x-green-400 dark:text-white dark:border-gray-600 dark:focus:border-green-400 peer"
                  placeholder=" "
                />
                <label
                  htmlFor={field.name}
                  className="absolute text-sm text-green-500 font-semibold dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-green-400 peer-focus:dark:text-green-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1q"
                >
                  {field.label}
                </label>
              </div>
            ))}
          </form>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-8 font-serif font-bold mt-[6vh]">
          <h2 className="text-xl font-semibold mb-4 hover:text-green-400">
            Payment Method
          </h2>
          <label className="flex items-center">
            <input
              type="radio"
              name="paymentMethod"
              value="Razorpay"
              checked={paymentMethod === "PhonePe"}
              onChange={() => setPaymentMethod("PhonePe")}
              className="mr-2"
            />
            PhonePe
          </label>
          <label className="flex items-center mt-4">
            <input
              type="radio"
              name="paymentMethod"
              value="COD"
              checked={paymentMethod === "COD"}
              onChange={() => setPaymentMethod("COD")}
              className="mr-2"
            />
            Cash on Delivery
          </label>
          <Pric agreed={agreed} setAgreed={setAgreed} />
        </div>

        {/* Order Summary */}
        <div className="mb-8 mt-[6vh]">
          <h2 className="text-xl font-semibold mb-4 font-serif hover:text-green-400">
            Order Summary
          </h2>
         <div className="border rounded-md p-4">
  <div className="flex justify-between mb-2 font-semibold">
    <span>Subtotal</span>
    <span>₹{subtotal}</span>
  </div>

  <div className="flex justify-between mb-2 font-semibold text-red-500">
    <span>Delivery Charges</span>
    <span>₹{DELIVERY_CHARGE}</span>
  </div>

  {paymentMethod === "COD" && (
    <div className="flex justify-between mb-2 font-semibold text-red-500">
      <span>COD Handling Charges</span>
      <span>₹{COD_HANDLING_CHARGE}</span>
    </div>
  )}

  <div className="flex justify-between font-bold mt-2 text-green-700">
    <span>Total Payable</span>
    <span>₹{totalPayable}</span>
  </div>
</div>

        </div>

        {/* Proceed to Payment Button */}
        <button
          onClick={handlePayment}
          disabled={!agreed || isProcessing}
          className={`px-4 py-2 rounded-md font-semibold transition-colors duration-300 mt-4 ${
            !agreed || isProcessing
              ? "bg-green-200 text-white cursor-not-allowed"
              : "bg-green-500 text-white hover:bg-orange-500"
          }`}
        >
          {isProcessing ? "Processing..." : "Pay Now"}
        </button>
      </div>

     {showFormPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4 font-serif ">
              Form Incomplete!
            </h2>
            <p>
              Please fill out the shipping address form before proceeding to
              payment.
            </p>
            <button
              className="hover:bg-orange-500 bg-green-400 text-white px-4 py-2 rounded-md mt-4 font-semibold"
              onClick={() => setShowFormPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showNameError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-80 text-center">
            <h2 className="text-xl font-semibold text-red-500 mb-4 font-serif">
              Invalid Name
            </h2>
            <p className="text-gray-700 font-semibold">
              First Name and Last Name should only contain letters.
            </p>
            <button
              onClick={() => setShowNameError(false)} // Close the error popup
              className="mt-4 px-6 py-2 bg-red-500 text-white rounded-md font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showPhoneError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-80 text-center">
            <h2 className="text-xl font-semibold text-red-500 mb-4 font-serif">
              Invalid Phone Number
            </h2>
            <p className="text-gray-700 font-semibold">
              Please enter a valid 10-digit phone number.
            </p>
            <button
              onClick={() => setShowPhoneError(false)} // Close the error popup
              className="mt-4 px-6 py-2 bg-red-500 text-white rounded-md font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showEmailError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-80 text-center">
            <h2 className="text-xl font-semibold text-red-500 mb-4 font-serif">
              Invalid Email
            </h2>
            <p className="text-gray-700 font-semibold">
              Please enter a valid email address.
            </p>
            <button
              onClick={() => setShowEmailError(false)} // Close the error popup
              className="mt-4 px-6 py-2 bg-red-500 text-white rounded-md font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showPincodeError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-80 text-center">
            <h2 className="text-xl font-semibold font-serif text-red-500 mb-4">
              Invalid Pincode
            </h2>
            <p className="text-gray-700 font-semibold">
              Please enter a valid 6-digit pincode.
            </p>
            <button
              onClick={() => {
                setPaymentDetails(null);
                setShowPopup(false);
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showPopup && (
        <div className="popup">
          {paymentDetails?.status === "FAILED" && (
            <div className="fixed inset-0 flex items-center justify-center mt-[5vh] bg-black bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-md shadow-lg text-center relative">
                <div className="text-lg font-semibold mb-2">
                  ❌ Payment Failed
                </div>
                <Link href="/checkout">
                  <button
                    className="bg-green-500 hover:bg-orange-400 text-white px-4 py-2 rounded-md mt-4"
                    onClick={() => {
                      setPaymentDetails(null);
                      setShowPopup(false);
                    }}
                  >
                    Close
                  </button>
                </Link>
              </div>
            </div>
          )}

          {paymentDetails?.status === "PENDING" && (
            <div className="fixed inset-0 flex items-center justify-center mt-[5vh] bg-black bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-md shadow-lg text-center relative">
                <div className="text-lg font-semibold mb-2">
                  ⏳ Payment is Processing...
                </div>
                <Link href="/checkout">
                  <button
                    className="bg-green-500 hover:bg-orange-400 text-white px-4 py-2 rounded-md mt-4"
                    onClick={() => {
                      setShowPopup(false);
                    }}
                  >
                    Close
                  </button>
                </Link>
              </div>
            </div>
          )}

          {paymentDetails?.status === "Order Created" && (
            <div className=" fixed inset-0 flex items-center justify-center mt-[5vh] bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-md shadow-lg">
                <h2 className="text-xl font-semibold mb-4 font-serif">
                  Order Confirmed!
                </h2>

                <p>
                  <strong>Order ID:</strong> {paymentDetails.orderId}
                </p>
                <p>
                  <strong>Payment Method:</strong>{" "}
                  {paymentDetails.paymentMethod}
                </p>
                <p>
                  <strong>Payment ID:</strong>{" "}
                  {paymentDetails.razorpayPaymentId}
                </p>

                <p>
                  <strong>Shipping Address:</strong>
                  <br />
                  {`${paymentDetails.address.firstName} ${paymentDetails.address.lastName}`}
                  <br />
                  {paymentDetails.address.address}
                  <br />
                  {paymentDetails.address.state},{" "}
                  {paymentDetails.address.pincode}
                  <br />
                  <strong>Email:</strong> {paymentDetails.address.email}
                  <br />
                  <strong>Phone:</strong> {paymentDetails.address.phone}
                </p>

                <h3 className="mt-4 font-semibold">Cart Summary:</h3>
                {paymentDetails.cart.map((item: CartItem) => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}

                <div className="flex justify-between font-bold mt-4">
                  <span>Subtotal</span>
                  <span>₹{paymentDetails.totalPayable}</span>
                </div>

                <div className="flex justify-between font-bold mt-4">
                  <span>Savings</span>
                  <span>
                    ₹{paymentDetails.mrpTotal - paymentDetails.subtotal}
                  </span>
                </div>

                <Link href="/account">
                  <button
                    className="bg-green-500 hover:bg-orange-400 text-white px-4 py-2 rounded-md mt-4"
                    onClick={() => {
                      paymentDetails.cart.forEach((item: CartItem) =>
                        removeFromCart(item.id)
                      );
                      setShowPopup(false);
                    }}
                  >
                    Close
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Checkout;
