"use client"

import { CartProvider } from "@/components/CartContext";
import Navbar from "@/components/Navbar";
import Products from "./Products";
import Hom from "@/components/Hom"
import { Suspense } from "react";
import ReviewPage from "./Reveiw";


export const dynamic = "force-dynamic";

function App() {
  return (
 
      <div >
          <Navbar/>
          {/* <Hom/> */}
          
    <CartProvider>
     <Suspense fallback={<p>Loading...</p>}>
     
      <Products />
      {/* <ReviewPage/> */}
    </Suspense>
      
    </CartProvider>
 </div>
      


    
 
  );
}

export default App;



