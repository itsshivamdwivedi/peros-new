"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { useCart } from "@/contexts/CartContext"; 
import gsap from "gsap";
import Link from "next/link";
import ScrollTrigger from "gsap/ScrollTrigger";
import { v4 as uuidv4 } from "uuid";
import Footer from "@/components/Footer";


import { FaStar, FaChevronLeft, FaChevronRight, FaStarHalfAlt } from "react-icons/fa";

const CustomerReviews = () => {

}
const totalReviews = 39;
const averageRating = 4.9;
const ratingDistribution = [
  { stars: 5, count: 25 },
  { stars: 4, count: 8 },
  { stars: 3, count: 4 },
  { stars: 2, count: 2 },
  { stars: 1, count: 0 },
];

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
          "/assets/newjar.png",
        
      
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
        "/assets/newjar.png",
      
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
        "/assets/newjar.png",
          
         
          
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
    <div className="w-full  lg:sticky top-20 max-h-screen overflow-auto relative z-10 sm:mt-4 ">
      
      <div className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 flex flex-col lg:flex-row xl:mt-10  mt-4 ">
      
        <div className="w-full lg:w-1/2  lg:sticky top-20 h-max" >
          <div className="h-[400px]  relative">
            <Image
              src={currentImage}
              width={400}
              height={400}
              alt={selectedVariant.name}
              // fill
              className="object-cover rounded-md "
              

            />
          </div>
          {/* <div className="flex mt-4">
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
          </div> */}
        </div>

        <div className="w-full lg:w-1/2 xl:mt-16  "  >
          <h1 className="text-3xl font-semibold mb-1 font-sans">{selectedVariant.name}</h1>
          {/* <p className="text-lg text-gray-500 mb-4 ">{selectedVariant.description}</p> */}
          <h2 className="text-sm font-semibold flex text-yellow-200 mb-5">
          {[...Array(5)].map((_, index) => (
        <FaStar key={index} />
      ))} <span className="text-gray-300 text-sm px-2">(213 Reviews)</span>
          </h2>
          <h2 className="text-3xl font-semibold">
            ₹{selectedSize.price} <span className="text-red-500 font-medium text-sm">-10%</span>
          </h2>
          <div className="flex flex-col items-start gap-1 ">
            <h3 className="line-through text-gray-400">M.R.P: ₹{selectedSize.pricel}</h3>
            <h3 className="text-black font-sans">Tax included</h3>
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
                      ? "bg-green-600 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
         

         
          <div>
          <div className='flex flex-col gap-4'>
          
          <div className=' sm:flex sm:flex-row gap-3 flex flex-col  '>
     
     <div className="grid grid-cols-2 gap-2 sm:gap-16 ">
     <div className='flex    justify-between mt-4 overflow-hidden rounded-md ring-1 ring-gray-400 md:w-[18vw] h-9 sm:h-9 items-start'>
      <button  className="cursor-pointer flex justify-center content-center     w-[10vw] lg:w-10 sm:w-10  2xl:w-20 font-bold text-3xl items-center text-black"onClick={() => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))} >-</button>
     <span className=' mt-2'> {quantity}</span>    
        <button  className="cursor-pointer flex justify-center content-center    w-[10vw] lg:w-10 sm:w-10  2xl:w-20 font-bold text-3xl items-center mt-1 text-black"onClick={() => setQuantity((prev) => prev + 1)}>+</button>   
          </div>
          <div className="flex items-end"><button className='w-full text-sm md:w-[18vw] disabled:bg-pink-200 disabled:text-white disabled:ring-none ring-1 bg-green-600 px-4 py-2 rounded-md font-semibold hover:text-white hover:bg-amber-400 disabled:cursor-not-allowed text-white'
       
       onClick={handleAddToCart}
       
       >Add to Cart </button></div> 

     </div>
    
       


          
</div>
<div className='flex '> <Link href ="/cart"> <button className='w-[92vw] sm:w-full md:w-[18vw] text-sm disabled:bg-pink-200 disabled:text-white bg-green-600 text-white hover:bg-amber-400 disabled:ring-none rounded-md ring-1 font-semibold ring-green-500 px-4 py-2 disabled:cursor-not-allowed '
        onClick={handleAddToCart}  >Buy it now</button></Link>  </div>

          
        </div>

      </div>


    </div>
    <div className="flex flex-col items-center space-y-4">
    <p className="text-gray-300 text-sm md:text-xl mt-1 font-semibold font-sans">Safe and Guaranteed Checkout</p>
    <div className="flex flex-wrap justify-center gap-4 md:gap-6">
        <img src="/assets/Visa.png" alt="Visa" className="h-6 md:h-12 w-auto" />
        <img src="/assets/ms.png" alt="MasterCard" className="h-6 md:h-12 w-auto" />
        <img src="/assets/rupay.png" alt="RuPay" className="h-6 md:h-12 w-auto" />
        <img src="/assets/upi.png" alt="UPI" className="h-6 md:h-12 w-auto" />
        {/* <img src="/path-to-maestro.png" alt="Maestro" className="h-8 md:h-12 w-auto" /> */}
    </div>
</div>

      </div>
     
    
  
    </div>
 
    <div className="relative w-full  flex flex-col items-center text-center px-4 md:px-12 mt-5">
      {/* Gradient Background */}
      <div className="absolute top-0 left-0 w-full h-[150px] md:h-[200px] bg-cover bg-center bg-no-repeat " > <img src="/assets/gradient 1-02.png" alt="" /></div>
      
      {/* Heading */}
      <div className="relative mt-10  px-2 md:mt-24">
        <h1 className="text-xl  md:text-2xl font-bold">
          Luxury That Melts in Your Mouth, <br className="hidden md:block" />
          Strength That Fuels Your Day
        </h1>
      </div>
      
      {/* Middle Image with Text */}
      <div className="relative flex justify-center items-center mt-10 md:mt-16">
        <Image
          src="/assets/perosmiddle.png"
          alt="Peros Branding Image"
          width={500}
          height={300}
          layout="intrinsic"
          objectFit="contain"
        />
      </div>
      
      {/* Description */}
      <p className="relative mt-8 md:mt-12 text-gray-400 text-start text-xs mb-4 md:text-base max-w-2xl">
        The story of Peros Chocolate Peanut Butter begins where the <strong>world’s finest peanuts</strong> meet the <strong>purest cocoa</strong>
        — an indulgence crafted for those who refuse to settle for the ordinary.
      </p>
    </div>





      <div className="flex flex-col ">
      {/* <div className="relative overflow-hidden">
  <img
    src="\assets\green1.png"
    className="image object-cover w-[1100px]"
    width={1100}  // Increase the width value here
    height={500}
    alt="Image 1"
  />
</div> */}
          <div className="relative w-full  flex flex-col items-center text-center px-4 md:px-12 ">
      {/* Gradient Background */}
      <div className="absolute top-0 left-0 w-full md:h-[250px] bg-contain bg-no-repeat h-full sm:absolute  s  "><img src="/assets/gradient 2-02.png" alt="" /></div>
     
      
      {/* Heading */}
      <div className="relative mt-20 md:mt-44 sm:mt-36 text-white font-sans">
        <h1 className="text-2xl md:text-6xl font-bold text-white sm:mt-36 sm:text-4xl  sm:py-2 md:py-3 ">The Secret? </h1>
        <span className=" text-2xl font-normal md:6xl sm:text-4xl">Premium Ingredient,No Compromise</span>
        <p className="mt-4 font-thin text-xs  max-w-2xl sm:text-xl md:text-2xl  sm:py-3 md:py-4 text-start">
         We source handpicked, high-quality peanuts from the <span className="font-semibold">souther regions of Asia -</span>renowned for their rich flavour and smooth texture. Combined with luxury-grade cocooa. every spoonful delivers a silky-smooth experience that melts effortlessy on your palate
        </p>
      </div>

      <div className="relative flex justify-center items-center mt-1 md:mt-24 sm:mt-16">
      <div>
      <Image
          src="/assets/high q peanuts-02.png"
          alt="image1"
          width={500}
          height={300}
          layout="intrinsic"
          objectFit="contain"
        />
        
      </div>
      <div>
      <Image
          src="/assets/smooth tex-02.png"
          className=""
          alt="image2"
          width={325}
          height={300}
          layout="intrinsic"
          objectFit="contain"
        />
        
      </div>
      <div>
      <Image
          src="/assets/cocoa-02.png"
          alt="image3"
          width={500}
          height={300}
          layout="intrinsic"
          objectFit="contain"
        />
        
      </div>

      </div>


      
      
     
      <div className="relative mt-16 md:mt-72 sm:h-96  w-full max-w-lg pb-2 sm:mt-44 px-5 ">
        <Image
          src="/assets/did you know-02.png"
          alt="Nutritional Information"
          width={500}
          height={300}
          layout="intrinsic"
          objectFit="contain"
        />
      </div>
    </div>
    
      
     
    </div>
   

<div className="flex flex-col items-center px-4 py-10 md:px-20 sm:mt-40  sm:z-10 md:mt-[55vw]">
      <h2 className="text-2xl md:text-2xl font-bold text-center px-6 ">
        Satisfy Your Chocolate Craving Without Guilt!
      </h2>
      <p className="px-6 text-xs  text-start md:text-base text-gray-400 mt-2">
        Many people love chocolate but often feel guilty after eating it.
        Here’s why and how <strong>Peros Chocolate Peanut Butter</strong> can be a guilt-free alternative.
      </p>
      
      {/* Image Section */}
      <div className="w-full flex justify-center mt-6">
        <img 
          src="/assets/comparsion-02.jpg" 
          alt="Comparison" 
          className="w-full max-w-md md:max-w-lg"
        />
      </div>
      <h2 className="text-2xl md:text-6xl sm:4xl  font-semibold text-center px-4 mt-16">
      Enjoy the Rich Taste of
      Chocolate, Without the Guilt!
      </h2>
      <p className="text-center  font-spartan text-sm md:ml-12 md:text-4xl text-gray-600 mt-2">
      Peros Chocolate Peanut Butter gives you the best of both
worlds—delicious chocolate flavor with added nutrition.
Switch today and snack smarter!
      </p>
    </div>

    <div className="relative w-full  flex flex-col items-center text-center px-4 md:px-12 sm:flex">
      {/* Gradient Background */}
      <div className="absolute top-0 left-0 w-full md:h-[250px] bg-contain bg-no-repeat h-full  sm:absolute sm:-z-10  " > <img src="/assets/gradient 3-02.png" alt=""  /></div>
     
      
      {/* Heading */}
      {/* <div className="relative mt-24 md:mt-32">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-700">We Serve</h1>
        <h2 className="text-2xl md:text-2xl font-semibold text-yellow-800">Goodness with Nuts</h2>
        <p className="mt-4 text-gray-700 text-sm md:text-base max-w-2xl">
          We are more than just a brand; we are a movement toward a healthier future. Be a part of our journey as we continue to innovate, inspire, and nourish the world—one spoonful at a time.
        </p>
      </div> */}
      
      {/* Nutritional Information Image */}
      <div className="relative mt-10 md:mt-44 w-full max-w-lg pb-52  ">
        <Image
          src="/assets/we serve-02.png"
          alt="Nutritional Information"
          width={500}
          height={300}
          layout="intrinsic"
          objectFit="contain"
        />
      </div>
    </div>
    


  <div className="bg-white sm:w-full sm:py-10">
  <div className="max-w-md mx-auto p-6 text-center bg-white shadow-lg sm:shadow-none rounded-2xl  sm:w-[90vw] ">
      <h2 className="text-5xl px-8 font-bold">Customer Reviews</h2>
      <div className="flex justify-center items-center my-2">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={`text-yellow-500 ${i < Math.round(averageRating) ? "" : "opacity-30"}`}
          />
        ))}<span className="font-normal ml-1"> {averageRating}  out of 5 </span>
        
      </div>
      <span className="font-normal">  Based on {totalReviews} reviews</span>
     
       
     
      <div className="my-4 px-16">
        {ratingDistribution.map((rating, index) => (
          <div key={index} className="flex items-center mb-1">
            <div className="text-yellow-500 flex">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className={i < rating.stars ? "" : "opacity-30"} />
              ))}
            </div>
            <div className="w-full bg-gray-200 h-2 ml-2 ">
              <div
                className="bg-yellow-500 h-2 "
                style={{ width: `${(rating.count / totalReviews) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-4">
        <button className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700">
          <FaChevronLeft />
        </button>
        <button className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700">
          <FaChevronRight />
        </button>
      </div>
    </div>
  </div>

  <div className="sm:bg-white sm:w-full sm:py-10 ">
  <div className="max-w-lg mx-auto p-6 text-left bg-white shadow-lg sm:shadow-none rounded-2xl">
      <h2 className="text-lg font-semibold mb-4 ">Our Certificates</h2>
      <div className="flex  gap-4 flex-wrap mb-12">
        <img src="/assets/gg.png" alt="GMP Quality" className="h-12 w-auto" />
        <img src="/assets/iso.png" alt="ISO 9001:2024" className="h-12 w-auto" />
        <img src="/assets/safaai.png" alt="FSSAI" className="h-12 w-auto" />
      </div>
      <h3 className="text-xl font-bold">PEROS PEANUT BUTTER PVT</h3>
      <p className="text-sm text-gray-600">CIN: U15400CT2022PTCO13184</p>
      <p className="text-xs font-normal
       text-gray-500 mt-4 text-center">© 2025 PEROS. All rights reserved.<br/> Powered by Organic Goodness</p>
    </div>
  </div>
   
    {/* <Footer/> */}
    <Footer/>
    {/* vishal gandu1 */}
 
    


   </div>



  );
};

export default Products;
