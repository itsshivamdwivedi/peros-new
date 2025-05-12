"use client";


import React, { useEffect, useRef, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { gsap } from "gsap";
import { db } from "@/lib/firebase";// Assuming you've already exported db from firebaseConfig.jsx

import Router from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { Timestamp } from "firebase/firestore";
import Pric from "../../../components/pric" 
import { doc, setDoc,   arrayUnion } from "firebase/firestore";
import Link from "next/link";









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

type PaymentDetails = {
  orderId: string;
  paymentMethod: "COD" | "Razorpay"; // specify the possible values for paymentMethod
  razorpayPaymentId?: string; // razorpayPaymentId is optional
  address: AddressDetails;
  cart: CartItem[];
  subtotal: number;
  mrpTotal:number;
  userEmail :string;

};

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout = () => {
  const { cart, removeFromCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const router =Router
  const { user } = useAuth();
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
   const [agreed, setAgreed] = useState(false);
  const [showFormPopup, setShowFormPopup] = useState(false); // Popup for form warning
  const [showPopup, setShowPopup] = useState(false); // Payment success popup
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "Razorpay">("Razorpay"); // Added payment method
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

  const [isCartOpen, setIsCartOpen] = useState(false); // For showing/hiding cart details

  const checkoutRef = useRef<HTMLDivElement | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null); // Reference for form animation

  // Calculate subtotal
  const subtotal = cart.reduce(
    (total: number, item: any) => total + item.price * item.quantity,
    0
  );
  const mrpTotal= cart.reduce(
    (total :number,item:any)=> total +item.pricel *item.quantity,
    0
  ) ;
  


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
  
      // Log the data you're going to save for debugging purposes
      console.log("Saving payment details:", paymentDetails);
  
      // Store payment details directly in the user's document, appending to the `orders` array
      await setDoc(
        userRef,
        {
          orders: arrayUnion({
            ...paymentDetails, // Save the entire payment details in the `orders` array
            createdAt: Timestamp.now(), // Use Firestore Timestamp
          }),
          cart: [], // Optionally clear the cart after the order is completed
        },
        { merge: true } // Use merge to prevent overwriting the entire document
      );
  
      console.log("Payment and cart details saved in the user's document");
  
      // Update the state with payment details
      setPaymentDetails(paymentDetails);
  
      // Show the success popup
      setShowPopup(true);
    } catch (error) {
      console.error("Error storing payment details: ", error);
    }
  };
  const handlePayment = async () => {
    if (cart.length === 0) {
      setShowCartEmptyError(true); // Show the cart empty error popup
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
      setShowNameError(true); // Show name error popup
      return;
    }
  
    if (!validatePhone(address.phone)) {
      setShowPhoneError(true); // Show phone error popup
      return;
    }
  
    if (!validateEmail(address.email)) {
      setShowEmailError(true); // Show email error popup
      return;
    }
  
    if (!validatePincode(address.pincode)) {
      setShowPincodeError(true); // Show pincode error popup
      return;
    }
  
    setIsProcessing(true);
  
    try {
      const orderId = generateOrderId();
  
      // 👉 Create shipment
      await fetch("/api/create-shipment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          cart,
          orderId,
        }),
      });
  
      if (paymentMethod === "Razorpay") {
        const response = await fetch("/api/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: subtotal, orderId }),
        });
  
        if (!response.ok) {
          throw new Error("Failed to create Razorpay order");
        }
  
        const data = await response.json();
  
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: subtotal * 100,
          currency: "INR",
          name: "Peros",
          description: "Test Transaction",
          order_id: data.orderId,
          handler: (response: any) => {
            const paymentDetails: PaymentDetails = {
              orderId,
              paymentMethod: "Razorpay",
              razorpayPaymentId: response.razorpay_payment_id,
              address,
              cart,
              subtotal,
              mrpTotal,
              userEmail: user.email,
            };
  
            storePaymentDetails(paymentDetails);
          },
          prefill: {
            name: `${address.firstName} ${address.lastName}`,
            email: address.email,
            contact: address.phone,
          },
          theme: { color: "#3399cc" },
        };
  
        const rzp1 = new window.Razorpay(options);
        rzp1.open();
      } else {
        const paymentDetails: PaymentDetails = {
          orderId,
          paymentMethod: "COD",
          razorpayPaymentId: orderId, // Placeholder for COD
          address,
          cart,
          subtotal,
          mrpTotal,
          userEmail: user.email,
        };
  
        storePaymentDetails(paymentDetails);
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
          <h2 className="text-xl font-semibold font-serif mb-4 hover:text-green-400">Shipping Address</h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/** Floating Input Fields */}
            {[
              { name: "firstName", label: "First Name"  },
              { name: "lastName", label: "Last Name" },
              { name: "phone", label: "Phone Number", type: "phone no" },
              { name: "email", label: "Email", type: "email" },
              { name: "address", label: "Address", span: 2 },
              { name: "state", label: "State" },
              { name: "pincode", label: "Pincode" },
            ].map((field, idx) => (
              <div className="relative"key={field.name || idx}>
              <input
                type={field.type || "text"}
                name={field.name}
                value={address[field.name]}
                onChange={(e) =>
                  setAddress({ ...address, [field.name]: e.target.value })
                }
                required
                id={field.name} // Add id to link with label
                className="block w-full px-2.5 pb-2.5 font-semibold pt-4 text-sm text-black bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-x-green-400 dark:text-white dark:border-gray-600 dark:focus:border-green-400 peer"
                placeholder=" " // Keep placeholder empty to let the label float
              />
              <label
                htmlFor={field.name}
                className="absolute text-sm text-green-500 font-semibold dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-green-400 peer-focus:dark:text-green-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1q"
              >
                {field.label} {/* Field label as per your dynamic data */}
              </label>
            </div>
            

            ))}
          </form>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-8 font-serif font-bold mt-[6vh]">
          <h2 className="text-xl font-semibold mb-4 hover:text-green-400">Payment Method</h2>
          <label className="flex items-center">
            <input
              type="radio"
              name="paymentMethod"
              value="Razorpay"
              checked={paymentMethod === "Razorpay"}
              onChange={() => setPaymentMethod("Razorpay")}
              className="mr-2"
            />
            Razorpay
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
          <h2 className="text-xl font-semibold mb-4 font-serif hover:text-green-400">Order Summary</h2>
          <div className="border rounded-md p-4">
            <div className="flex justify-between mb-2 font-semibold">
              <span >Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

            {/* Cart Details Dropdown */}
            <div>
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="bg-gray-200 p-2 rounded-md mt-4 w-full text-left font-semibold"
              >
                {isCartOpen ? "Hide Cart Details" : "Show Cart Details"}
              </button>

              {isCartOpen && (
                <div className="mt-2">
                      {cart.map((item:any)  => (
                    <div key={item.id} className="flex justify-evenly content-center ">
                      <div><span><img src={item.image} className="w-20 h-20 object-cover mr-4 xl:object-center xl:w-[50wh] xl:h-[20vh]   "  alt="" /> </span></div>
                      <div className="flex justify-center content-center self-center">{item.name} x {item.quantity} </div>
                      <div className="flex justify-center content-center self-center">  ₹{item.price * item.quantity}</div>
                      
                      
                     
                    </div>
                  ))}
                </div>
              )}
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


      {showCartEmptyError && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded-lg w-80 text-center">
      <h2 className="text-xl font-semibold text-red-500 mb-4 font-serif ">
        Cart is Empty
      </h2>
      <p className="text-gray-700 font-semibold">
        Please add some products to your cart before proceeding to payment.
      </p>
      <Link href="/products"><button
        onClick={() => setShowCartEmptyError(false)} // Close the popup
        className="mt-4 px-6 py-2 bg-red-500 text-white rounded-md font-semibold hover:bg-green-400"
      >
        Shop Now
      </button></Link>
     
    </div>
  </div>
)}



      {/* Form Incompletion Popup */}
     {/* Form Incompletion Popup */}
    {showFormPopup && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-md shadow-lg">
          <h2 className="text-xl font-semibold mb-4 font-serif ">Form Incomplete!</h2>
          <p>Please fill out the shipping address form before proceeding to payment.</p>
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
              onClick={() => setShowPincodeError(false)} // Close the error popup
              className="mt-4 px-6 py-2 bg-red-500 text-white rounded-md font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}


      {/* Order Confirmation Popup */}
      {showPopup && paymentDetails && (
        <div className="fixed inset-0 flex items-center justify-center mt-[5vh] bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4 font-serif">Order Confirmed!</h2>
            <p>
              <strong>Order ID:</strong> {paymentDetails.orderId}
            </p>
            <p>
              <strong>Payment Method:</strong> {paymentDetails.paymentMethod}
              
            </p>
            <p>
             
              <strong>Payment_ID</strong> {paymentDetails.razorpayPaymentId}
            </p>
            <p>
              <strong>Shipping Address:</strong>
              <br />
              {`${address.firstName} ${address.lastName}`}
              <br />
              {address.address}
              <br />
              {address.state}, {address.pincode}
              <br />
              <strong>Email:</strong> {address.email}
              <br />
              <strong>Phone:</strong> {address.phone}
            </p>
            <h3 className="mt-4 font-semibold">Cart Summary:</h3>
            {cart.map((item :CartItem) => (
              <div key={item.id} className="flex justify-between">
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold mt-4">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between font-bold mt-4">
              <span>Savings</span>
              <span>₹{mrpTotal-subtotal}</span>
            </div>
           
            
        <Link href ="/account"> <button
              className="bg-green-500 hover:bg-orange-400 text-white px-4 py-2 rounded-md mt-4"
              onClick={() => {
                
                cart.forEach((item: CartItem) => removeFromCart(item.id)); 
                setShowPopup(false);
              }}
            >
              Close
            </button> </Link>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default Checkout;