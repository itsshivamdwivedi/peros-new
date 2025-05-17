"use client"

import { CartProvider } from "@/components/CartContext";
import Navbar from "@/components/Navbar";
import Products from "./Products";
import Hom from "@/components/Hom"
import { Suspense } from "react";

export const dynamic = "force-dynamic";

function App() {
  return (
 
      <div >
          <Navbar/>
          {/* <Hom/> */}
          
    <CartProvider>
     <Suspense fallback={<p>Loading...</p>}>
      <Products />
    </Suspense>
      
    </CartProvider>
 </div>
      


    
 
  );
}

export default App;



