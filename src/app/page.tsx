"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hom from "@/components/Hom";
import Footer from "@/components/Footer";
import Content from "@/components/Content";
import Loader from "../components/Loader"; 

import { ScrollTrigger } from "gsap/ScrollTrigger";




export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
 
  

 
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); 

    return () => clearTimeout(timer);
  }, []);

  

  return (
    <main className="">
  
      {isLoading && <Loader />}

    
      {!isLoading && (
        <div>
          <Navbar />
       
      
      <Content/>

          
        </div>
     )}
    </main>
  );
}