"use client"

import { CartProvider } from "@/components/CartContext";
import Navbar from "@/components/Navbar";
import Products from "./Products";
import Hom from "@/components/Hom"


function App() {
  return (
 
      <div >
          <Navbar/>
          {/* <Hom/> */}
          
    <CartProvider>
     
      <Products />
     
      
    </CartProvider>
 </div>
      


    
 
  );
}

export default App;



