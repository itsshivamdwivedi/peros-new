"use client"


import { useEffect } from "react";
import Orders from "../checkout/order";
import Footer from "@/components/Footer";

export default function Page(){
     useEffect(() => {
       
        document.documentElement.style.height = "auto";
        document.body.style.height = "auto";
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      
        document.body.style.overflow = "auto";
      }, []);
    return(
        <main>
          
            
            <Orders/>
            
           <div className="mt-10"> <Footer/></div>
        </main>
    )
}