"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext"; 
import {  Trash } from "lucide-react"; 
import Link from "next/link";
import gsap from "gsap";
// import Navbar from "@/components/Navbar";
import Router from "next/router";
import Footer from "@/components/Footer";

export default function CartPage() {
  const { user } = useAuth();
  const { cart, removeFromCart, loading } = useCart(); 
  const textRef = useRef(null);
  const [loadingx, setLoadingx] = useState(true);
  const router =Router

  
  useEffect(() => {
    
    document.documentElement.style.height = "auto";
    document.body.style.height = "auto";
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  

    document.body.style.overflow = "auto";
  }, []);
  

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingx(false);
    }, 20);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  useEffect(() => {
    if (!loading && textRef.current) {
      
      gsap.fromTo(
        textRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'ease out' }
      );
    }
  }, [loadingx]);


  

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0); 
  };
  const calculatemrpTotal = () => {
    return cart.reduce((total, item) => total + item.pricel * item.quantity, 0); 
  };


  if (loading) {
    return <div>Loading...</div>; 
  }

  return (
    <div className="">  
    
    <div className=" px-[10vw] h-full mt-10  xl:mt-[15vh]">
     
     
        <h1 className="text-3xl font-serif font-bold hover:text-green-400   "   >Shopping Cart   </h1>
      <h1 className="border-b-4 w-28 border-green-500 mb-4 mt-1 " ></h1>
      {cart.length === 0 ? (
        <div className="grid w-full mt-[60vw] lg:mt-[25vw] justify-center content-center items-center font-semibold font-serif" ref={textRef} > There are no items in your cart.
       <Link href="/products"><button className="content-center bg-green-500 ml-8 mr-8 py-2 mt-2 px-[1vw] hover:bg-amber-400 text-white rounded-md">Continue Shopping</button> </Link>
           </div>
        ) : (
          <div>
            <div className=" ">
         
         <ul className="hidden xl:flex xl:mt-10">
           <li className="text-2xl font-serif font-semibold">PRODUCT</li>
          
         </ul>
      
      </div>
          
          


      <div
              
              className="flex-col justify-between items-center border-t border-b py-4 sm:flex-row sm:justify-between "
            >

              {cart.map((item) => (
                <li key={item.id} className="flex items-center justify-between mt-5">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image || "/assets/placeholder.png"} // Default image
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded-lg xl:object-contain xl:w-[50wh] xl:h-[20vh]"
                    />
                    <div>
                      <h2 className="text-lg font-semibold font-serif xl:px">{item.title}</h2>
                
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-600">
                        Size: {item.size}
                      </p>
                      <p className="text-sm text-gray-600">Price: ₹{item.price}</p>
                      <p className="text-sm text-gray-600">Mrp:{item.pricel}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-600 hover:text-red-800 transition xl:mr-10"
                  >
                    <Trash size={20} />
                  </button>
                </li>
              ))}
         
            
          </div>
          <div className="mt-8 ">
            <div className="text-xl font-bold f bg-gray-200  flex justify-between sm:justify-end sm:gap-[4vw] h-[10vh] content-center items-center self-center px-[2vw]  "> 
              <div> Total:
                <p className="text-green-500 text-medium">Savings:</p> </div>
              <div>₹{calculateTotal().toFixed(2)}
                
                <p className="text-green-500 text-medium">₹{calculatemrpTotal()-calculateTotal()}.00</p>
              </div>
            </div>
            
          
           
           
          </div>
         <div className=" flex-col content-center items-center self-center justify-center   xl:pl-[60vw]  md:pl-[30vw]">
        <Link href="/checkout"> <button className="bg-green-500 text-white px-4 font-semibold font-serif hover:bg-amber-400  py-2 rounded-md mt-4 w-full">
              Checkout
            </button></Link>
        
        <Link href ="/products"><button className="bg-green-500 text-white px-4 py-2  font-serif font-semibold  hover:bg-amber-400 rounded-md mt-4 w-full">
              Continue Shopping
            </button></Link>
         
         </div>
          </div>
             )}
     



            
   
      </div>
  



      <Footer/>
  
     
      
    </div>
    

      
    
     
      
      
 
  );
}
