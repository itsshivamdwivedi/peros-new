"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { useCart } from "@/contexts/CartContext"; 
import gsap from "gsap";
import Link from "next/link";
import ScrollTrigger from "gsap/ScrollTrigger";
import { v4 as uuidv4 } from "uuid";
import Footer from "@/components/Footer";




type Size = {
  label: string;
  price: number;
  pricel: number;
};

type UUID = string;

type Variant = {
  id: UUID;
  name: string;
  images: string[];
  description: string;
  sizes: Size[];
};

const peanutButterVariants: Variant[] = [
  {
        id: uuidv4(),
        name: "Classic Creamy",
        images: [
          "/assets/choco.png",
          "/assets/choco.png",
          "/assets/choco.png",
          "/assets/choco.png",
      
        ],
        description:
          "Smooth texture made with 100% roasted peanuts. Perfect for spreading on toast or baking.",
        sizes: [
          { label: "350g", price: 157 ,pricel:200},
          { label: "1kg", price: 475,pricel:500},
        ],
      },
      {
        id:  uuidv4(),
        name: "Crunchy Honey",
        images: [
          "/assets/classic.png",
          "/assets/classic.png",
          "/assets/classic.png",
          "/assets/classic.png",
      
      
        ],
        description:
          "Chunky texture with real peanut bits and a touch of honey for natural sweetness.",
        sizes: [
          { label: "350g", price: 170,pricel:200},
          { label: "1kg", price: 500,pricel:550},
        ],
      },
      {
        id:  uuidv4(),
        name: "Dark Chocolate",
        images: [
          "/assets/creamy.png",
          "/assets/creamy.png",
          "/assets/creamy.png",
          "/assets/creamy.png",
          
         
          
        ],
        description:
          "A blend of peanuts, dark cocoa, and sea salt for a rich, indulgent flavor.",
        sizes: [
          { label: "350g", price: 180,pricel:210},
          { label: "1kg", price: 525,pricel:600}
        ],
      },
];

const Products: React.FC = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<Variant>(
    peanutButterVariants[0]
  );
  const [currentImage, setCurrentImage] = useState<string>(
    selectedVariant.images[0]
  );
  const [selectedSize, setSelectedSize] = useState<Size>(
    selectedVariant.sizes[0]
  );


  const descriptionRef = useRef<HTMLDivElement>(null);
 


  useEffect(() => {
    const watchImage = document.querySelector(".watch-image");

   
    gsap.fromTo(
      watchImage,
      {
        rotation: 0,
        scale: 1,  
      },
      {
        rotation: 360, 
        scale: 1.5,    
        scrollTrigger: {
          trigger: watchImage,
          start: "top top",    
          end: "+=200%",      
          scrub: 1,          
          pin: true,          
          anticipatePin: 1,   
        },
        duration: 3,
      }
    );
  }, []);


  useEffect(() => {
   
    gsap.to(".layer-1", {
      yPercent: -20, 
      scrollTrigger: {
        trigger: ".footer",
        start: "top bottom", 
        end: "bottom bottom", 
        scrub: true,
      },
    });

    gsap.to(".layer-2", {
      yPercent: -40, 
      scrollTrigger: {
        trigger: ".footer",
        start: "top bottom",
        end: "bottom bottom",
        scrub: true,
      },
    });

    gsap.to(".layer-3", {
      yPercent: -60, 
      scrollTrigger: {
        trigger: ".footer",
        start: "top bottom",
        end: "bottom bottom",
        scrub: true,
      },
    });
  }, []);


  


  
  
 

  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (boxRef.current) {
    
      gsap.fromTo(
        boxRef.current,
        { x: '100%', opacity: 0 }, 
        { x: '0%', opacity: 1, duration: 1.5, ease: 'power2.out' } 
      );
    }
  }, []);

  const leftBoxRef = useRef<HTMLDivElement>(null);
  const rightBoxRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loading) {
     
      gsap.fromTo(
        leftBoxRef.current,
        { x: '-100%', opacity: 0 },
        { x: '0%', opacity: 1, duration: 1.5, ease: 'power2.out' }
      );

      gsap.fromTo(
        rightBoxRef.current,
        { x: '100%', opacity: 0 },
        { x: '0%', opacity: 1, duration: 1.5, ease: 'power2.out' }
      );
    }
  }, [loading]);



  const { addToCart } = useCart(); 

  const handleVariantClick = (variantId: string) => {
    const variant = peanutButterVariants.find((v) => v.id === variantId);
    if (variant) {
      setSelectedVariant(variant);
      setCurrentImage(variant.images[0]);
      setSelectedSize(variant.sizes[0]);
    }
  };

  const handleSizeClick = (sizeLabel: string) => {
    const size = selectedVariant.sizes.find((s) => s.label === sizeLabel);
    if (size) {
      setSelectedSize(size);
    }
  };

  const handleAddToCart = () => {
    const cartItem = {
      id: selectedVariant.id,
      title: `${selectedVariant.name} - ${selectedSize.label}`,
      quantity,
      price: selectedSize.price,
      image: currentImage,
      size:selectedSize.label,
      pricel:selectedSize.pricel,
    };
    addToCart(cartItem); 

  };

  return (
    <div className="w-full  lg:sticky top-20 max-h-screen relative z-10 overflow-auto">
      
      <div className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 flex flex-col lg:flex-row xl:mt-10 gap-16 mt-4 ">
      
        <div className="w-full lg:w-1/2  lg:sticky top-20 h-max" ref={leftBoxRef}>
          <div className="h-[500px]  relative">
            <Image
              src={currentImage}
              width={400}
              height={400}
              alt={selectedVariant.name}
              // fill
              className="object-cover rounded-md "
              

            />
          </div>
          <div className="flex mt-4">
            {selectedVariant.images.map((image, index) => (
              <Image
              width={80}
              height={80}
                key={`${selectedVariant.id}-image-${index}`}
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className={`w-1/4 h-32 px-1 mt-8 rounded cursor-pointer object-cover transition-transform duration-300 transform hover:scale-110 ${
                  currentImage === image ? "" : "opacity-20"
                }`}
                onClick={() => setCurrentImage(image)}
              />
            ))}
          </div>
        </div>

        <div className="w-full lg:w-1/2 xl:mt-12"  ref={boxRef}>
          <h1 className="text-3xl font-bold mb-4 font-serif">{selectedVariant.name}</h1>
          <p className="text-lg text-gray-500 mb-4 ">{selectedVariant.description}</p>
          <h2 className="text-3xl font-bold">
            ₹{selectedSize.price} <span className="text-red-500 font-medium text-xl">-10%</span>
          </h2>
          <div className="flex items-center gap-4 ">
            <h3 className="line-through text-gray-400">M.R.P: ₹{selectedSize.pricel}</h3>
            <h3 className="text-gray-500">(Inclusive of all taxes)</h3>
          </div>

          <div className="flex flex-col gap-6 mt-4">
            <h4 className=" font-semibold font-serif">Variant</h4>
            <div className="flex items-center justify-between w-full gap-3">
              {peanutButterVariants.map((variant) => (
                <button
                              key={`variant-${variant.id}`}
                              onClick={() => handleVariantClick(variant.id)}
                              className={` font-bold text-sm rounded-md h-[8vh] py-1 px-4 hover:bg-amber-400 cursor-pointer font-serif  ${
                                variant.id === selectedVariant.id
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-200"
                              }`}
                            >
                              {variant.name}
                            </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6 mt-4">
            <h4 className="font-semibold font-serif">Size</h4>
            <div className="flex items-center gap-3">
              {selectedVariant.sizes.map((size) => (
                <button
                  key={size.label}
                  onClick={() => handleSizeClick(size.label)}
                  className={`py-1 px-4 rounded-md font-semibold ${
                    selectedSize.label === size.label
                      ? "bg-green-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
         

         
          <div>
          <div className='flex flex-col gap-4'>
          <div className='flex items-center  justify-between mt-4 overflow-hidden rounded-md ring-1 ring-black md:w-[18vw] '>
      <button  className="cursor-pointer flex justify-center content-center    bg-green-500 w-[10vw] lg:w-10 sm:w-10  2xl:w-20 font-bold text-3xl items-center text-white"onClick={() => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))} >-</button>
     <span className=''> {quantity}</span>    
        <button  className="cursor-pointer flex justify-center content-center    bg-green-500 w-[10vw] lg:w-10 sm:w-10  2xl:w-20 font-bold text-3xl items-center text-white"onClick={() => setQuantity((prev) => prev + 1)}>+</button>   
          </div>
          <div className=' sm:flex sm:flex-row gap-3 flex flex-col  '>
     
     <div><button className='w-full text-sm md:w-[18vw] disabled:bg-pink-200 disabled:text-white disabled:ring-none ring-1 bg-green-500 px-4 py-2 rounded-md font-semibold hover:text-white hover:bg-amber-400 disabled:cursor-not-allowed'
       
       onClick={handleAddToCart}
       
       >Add to Cart </button></div> 
       <div className=''> <Link href ="/cart"> <button className='w-full md:w-[18vw] text-sm disabled:bg-pink-200 disabled:text-white bg-green-500 text-white hover:bg-amber-400 disabled:ring-none rounded-md ring-1 font-semibold ring-green-500 px-4 py-2 disabled:cursor-not-allowed '
        onClick={handleAddToCart} >Buy it now</button></Link>  </div>


          
</div>

          
        </div>

      </div>


    </div>

    <div className="flex-col flex mt-5 gap-4" >
       
                
                
                <div className='sm'>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Magnam, maiores.</p>
                    
                </div>
                
                <div className='sm'>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Magnam, maiores.</p>
                    
                </div>
                
                <div className='sm'>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Magnam, maiores.</p>
                    
                </div>
                
                <div className='sm'>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Magnam, maiores.</p>
                    
                </div>
                
                <div className='sm flex gap-1'>
                    <h4 className='font-semibold'>Shelf Life:</h4>
                   <p>9 Months</p>
                    
                </div>
       </div>


      

        
       

       

       
       
      </div>
     
    
  
    </div>
    <div className="border-b-4 mt-[2vh] mb-[2vh] border-green-500  py-5  mx-[40vw]" ></div>






    
      <div className="flex flex-col ">
     
    
      <div className="relative overflow-hidden">
        <img
          src="\assets\p3.png"
          className="image object-cover w-full"
          alt="Image 1"
        />
        
      </div>
      <div className="relative overflow-hidden">
        <img
          src="/assets/p4.png"
          className="image object-cover w-full"
          alt="Image 2"
        />  
      </div>
      <div className="relative overflow-hidden">
        <img
          src="/assets/p5.png"
          className="image object-cover w-full"
          alt="Image 3"
        />  
      </div>
      <div className="relative overflow-hidden">
        <img
          src="/assets/p6.png"
          className="image object-cover w-full"
          alt="Image 4"
        />  
      </div>
      
     
    </div>
    
   
    <Footer/>


   </div>



  );
};

export default Products;
