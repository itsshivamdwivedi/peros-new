import React, { useEffect, useRef } from "react";
import AOS from "aos";
import "aos/dist/aos.css"; 
import "../app/globals.css";

import ExportedImage from "next-image-export-optimizer";
import { useState } from "react";
import Link from "next/dist/client/link";
import Footer from "./Footer";
import gsap from "gsap";






  type Size = {
  label: string;
  price: number;
  pricel: number;
};

type Variant = {
  id: string;
  name: string;
  images: string[];
  description: string;
  sizes: Size[];
  id1: number;
  detailedDescription: string;
  detailedDescription2: string;
  detailedDescription3: string;
  shelfLife: string;
};

const peanutButterVariants: Variant[] = [
  {
    id: "uuid-3",
    id1: 3,
    name: "Classic Creamy",
    images: [
      "/assets/jar 3.png",
      "/assets/slider-01-min.jpg",
      "/assets/slider-02-min.jpg",
      "/assets/slider-03-min.jpg",
    ],
    description:
      "Peros Classic Creamy Peanut Butter is crafted for those who love a smooth, rich spread without any compromise on quality.",
    detailedDescription: "",
    detailedDescription2: "",
    detailedDescription3: "",
    shelfLife: "12 Months",
    sizes: [
      { label: "350g", price: 157, pricel: 200 },
      { label: "1kg", price: 475, pricel: 500 },
    ],
  },
  {
    id: "uuid-2",
    id1: 2,
    name: "Crunchy Honey",
    images: [
      "/assets/jar 2.png",
      "/assets/slider-01-min.jpg",
      "/assets/slider-02-min.jpg",
      "/assets/slider-03-min.jpg",
    ],
    description:
      "Chunky texture with real peanut bits and a touch of honey for natural sweetness.",
    detailedDescription: "",
    detailedDescription2: "",
    detailedDescription3: "",
    shelfLife: "12 Months",
    sizes: [
      { label: "350g", price: 170, pricel: 200 },
      { label: "1kg", price: 500, pricel: 550 },
    ],
  },
  {
   
    id: "uuid-1",
    id1: 1,
    name: " Dark Chocolate Crunchy",
    images: [
      "/assets/jar 1.png",
      "/assets/slider-01-min.jpg",
      "/assets/slider-02-min.jpg",
      "/assets/slider-03-min.jpg",
    ],
    description:
      "A blend of peanuts, dark cocoa, and sea salt for a rich, indulgent flavor.",
    detailedDescription: "",
    detailedDescription2: "",
    detailedDescription3: "",
    shelfLife: "12 Months",
    sizes: [
      { label: "350g", price: 180, pricel: 210 },
      { label: "1kg", price: 525, pricel: 600 },
    ],
  },
];
  
  
const Content = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000, 
      easing: "ease-in-out",
      once: false, 
    });
   

  }, []);


   const [currentIndex, setCurrentIndex] = useState(0);

  const product = peanutButterVariants[currentIndex];

  const handleNextProduct = () => {
    setCurrentIndex((prev) => (prev + 1) % peanutButterVariants.length);
  };

  const images = [
    "/assets/jar 1.png",
    "/assets/jar 3.png",
    
    "/assets/jar 2.png",
    
    
   
  ];
  
  const flavorIcons = [
      "/assets/icon3.png",
    
    "/assets/icon2.png",
    "/assets/icon1.png",
  
  ];
  const flavorNames = [
     " Dark Chocolate Crunchy",
    "Classic Creamy",
    "Crunchy Honey",
   
  ];

    const [step, setStep] = useState(0); // Control which line is shown

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 500),   // Show "The"
      setTimeout(() => setStep(2), 1000),  // Show "Daily"
      setTimeout(() => setStep(3), 1500),  // Show "Indulgence"
    ];

    return () => timers.forEach(clearTimeout); // Cleanup
  }, []);


  return (
    <div className="flex flex-col items-center justify-center relative z-10 min-h-screen  bg-white ">

        <div className="bg-black w-full">
          <div className="relative w-full max-w-md mx-auto sm:mt-28 sm:bg-black">
     
      <img src="1.png" alt="Overlay" className="w-full h-auto sm:w-[60vw] sm:h-[120vh]" />

        <div className="absolute top-10 left-5 w-full p-4 text-white text-xl font-bold bg-black bg-opacity-50">
      {step >= 1 && (
        <p className="font-poppins text-2xl font-normal animate-fade-up">
          The
        </p>
      )}
      {step >= 2 && (
        <p className="font-poppins text-6xl py-3 font-medium animate-fade-up">
          Daily
        </p>
      )}
      {step >= 3 && (
        <p className="font-poppins text-6xl font-light animate-fade-up">
          Indulgence
        </p>
      )}

      <style jsx global>{`
        @keyframes fade-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-up {
          animation: fade-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
    </div>
        </div>
    
           <section className="flex items-center justify-center bg-black scroll-animate md:hidden ">
        <div className="md:w-full w-full p-4 flex flex-col justify-center items-center text-center pb-20 " data-aos="fade-up" data-aos-delay="200">
          <p className="text-2xl sm:text-3xl leading-relaxed font-spartan text-white ">
            Welcome to the Future of breakfast. Peros redefines peanut butter with a commitment to purity and wellness. Experience a new standard of taste and nutrition, crafted to energize your mornings and elevate your lifestyle.
          </p>
        </div>
      </section>
      <div>
        <div className="image md:hidden">
         <ExportedImage src="\Nutrition redefined.png"
         unoptimized={true}
         alt ="shivam"
         width={500}
         height={300}
        objectFit="cover"  
         
         />
        
        </div>
      </div>
   
      <section className="flex items-center justify-center bg-gradient-radial from-white via-blue-200 to-blue-400 h-screen scroll-animate hidden sm:flex">
        <div className="max-w-full space-x-16 flex flex-col md:flex-row w-full overflow-hidden">
          <div className="md:w-1/2 w-full p-8 flex flex-col justify-center items-start" data-aos="slide-right">
            <h2 className="text-5xl  text-green-800">Dark Chocolate</h2>
            <h2 className="text-5xl  text-green-800">Crunchy</h2>
            <Link href={`/products?id1=3`}>
            
            <button className="bg-gradient-to-r from-green-600 to-green-800 text-white py-3 px-8 my-8 font-semibold rounded-md uppercase transform hover:scale-105 transition" >
              Buy Now
            </button>
            </Link>
          </div>
          <div className="md:w-1/2 w-full p-8" data-aos="slide-left" data-aos-duration="1500" data-aos-delay="200">
            <img src="/assets/jar 1.png" alt="Product 2" className="w-full h-full" />
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center bg-gradient-radial from-white via-blue-200 to-blue-400 h-screen scroll-animate hidden sm:flex">
        <div className="max-w-full space-x-16 flex flex-col md:flex-row w-full overflow-hidden">
          <div className="md:w-1/2 w-full p-8" data-aos="slide-right" data-aos-duration="1200">
            <img src="/assets/jar 3.png" alt="Product 3" className="w-full h-full" />
          </div>
          <div className="md:w-1/2 w-full p-8 flex flex-col justify-center items-start" data-aos="slide-left">
            <h2 className="text-5xl  text-green-800">Dark Chocolate</h2>
            <h2 className="text-5xl  text-green-800">Classic</h2>
            <Link href={`/products?id1=1`}>
            
            <button className="bg-gradient-to-r from-green-600 to-green-800 text-white py-3 px-8 my-8 font-semibold rounded-md uppercase transform hover:scale-105 transition" >
              Buy Now
            </button>
            </Link>
          </div>
        </div>
      </section>


      {/* Product 2 */}
      <section className="flex items-center justify-center bg-gradient-radial from-white via-blue-200 to-blue-400 h-screen scroll-animate hidden sm:flex">
        <div className="max-w-full space-x-16 flex flex-col md:flex-row w-full overflow-hidden">
          <div className="md:w-1/2 w-full p-8 flex flex-col justify-center items-start" data-aos="slide-right" >
            <h2 className="text-5xl  text-green-800">Dark Chocolate</h2>
            <h2 className="text-5xl  text-green-800">Crunchy</h2>
           <Link href={`/products?id1=2`}>
            
            <button className="bg-gradient-to-r from-green-600 to-green-800 text-white py-3 px-8 my-8 font-semibold rounded-md uppercase transform hover:scale-105 transition" >
              Buy Now
            </button>
            </Link>
          </div>
          <div className="md:w-1/2 w-full p-8" data-aos="slide-left">
            <img src="/assets/jar 2.png" alt="Product 2" className="w-full h-full" />
          </div>
        </div>
      </section>
      



      

      {/* Product 3 */}
      

      {/* Product 4 */}
      <section className="scroll-animate bg-black ">
  <div className="flex flex-col md:flex-row rounded-lg w-full overflow-hidden  mt-12">
    <div className="md:w-1/2 w-full p-4 md:p-8" data-aos="slide-right" >
      <img
        src="/assets/home-images/spoonbg.png"
        alt="Product 4"
        className="w-full h-48 md:h-80 object-cover rounded-lg sticky-image"
      />
    </div>
    <div className="md:w-1/2 w-full p-6 md:p-12 flex flex-col justify-center items-start space-y-4 md:space-y-6 mb-6 md:mb-12" data-aos="fade-up" >
      <p className="text-xl md:text-2xl font-bold text-white items-center">
        <u>The Taste of Pure Goodness</u>
      </p>
      <p className="text-lg md:text-xl leading-relaxed text-white">
        At Peros, we believe that great health starts with great ingredients. Our premium peanut butter is made from the finest handpicked peanuts found only in the southrn part of Asia, ensuring an unmatched taste and nutrition in every spoonful.
      </p>
      <p className="text-lg md:text-xl leading-relaxed text-white">
        We sourced the finest premium peanuts from the southeren parts of Asia, known  for their superior flavor and nutrient profile. After months of research, testing, and refining, Peros Peanut Butter was created
      </p>
      <p className="text-lg md:text-xl leading-relaxed text-white">
       A brand that offers purity,taste, and high protein content without any artificial additives.
      </p>
    </div>
  </div>
</section>
      <div>
        <div className="image md:hidden">
         <ExportedImage src="\envato-labs-ai-12cdb9d1-83e5-4550-ae35-268ebf8f842d.jpg"
         unoptimized={true}
         alt ="shivam"
         width={440}
         height={400}
        objectFit="cover"  
         
         />
        
        </div>
      </div>
      {/* For mobile */}
      <section className="scroll-animate bg-black md:hidden pt-10 pb-10 ">
        <div className="flex flex-col md:flex-row rounded-lg w-full overflow-hidden ">
      
          <div className="md:w-1/2 w-full p-8 flex flex-col justify-center items-start space-y-6 mb-12" data-aos="fade-up" >
            <p className="text-2xl font-bold text-white items-center">
              <u>Our Vision</u>
            </p>
            <p className="text-xl leading-relaxed text-white">
               Peros is more than just a peanut butter brand--its a commitment to health , fitness, and survival of the fittest. As we grow, we plan to introduce more healthy and delicious products that align with our mission of promoting a stranger , healthier lifestyle.
            </p>
            <p className="text-xl text-white"> 
              Join the Peros Revolution 
            </p>
          </div>
        </div>
      </section>
    {/*  For mobile devices */}
     
        <div className="image md:hidden   bg-black">
         <ExportedImage src="\gym bag peros.png"
         unoptimized={true}
         alt ="shivam"
         width={440}
         height={500}
        objectFit="cover"       />      
        </div>
     

      {/* Ui for mobile */}
      <section className="flex flex-col items-center w-full justify-center min-h-screen bg-black py-12 pb-20">
    <div className="text-center mb-12 space-y-4">
      <h1 className="text-5xl font-bold text-white">3x Flavours</h1>
    </div>

    <div className="flex flex-col  sm:w-full items-center justify-center w-full   ">
      <div className="  flex flex-col items-center ">
        <div className=" w-full  ">
          {/* Main Product Image */}
          <img
            src={images[currentIndex]}
            alt="Flavor variant"
            className="w-full h-auto  transition-opacity duration-100 "
          />

          {/* Flavor Icon Buttons */}
          <div className="flex justify-center space-x-3 mt-8">
            {flavorIcons.map((iconSrc, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`
                  relative w-8 h-8 transition-all
                  ${currentIndex === index ? "scale-105 opacity-100" : "opacity-50"}
                `}
                title={`Flavor ${index + 1}`}
              >
                <img
                  src={iconSrc}
                  alt={`Flavor ${index + 1}`}
                  className="w-full h-full object-cover rounded-full"
                />
              </button>
            ))}
          </div>
          {/* Flavor Details / Buy Now */}
           <div className="w-full p-8 flex flex-col items-center ">
  <h3 className="text-2xl md:text-5xl font-bold text-white mb-6 text-center">
    {flavorNames[currentIndex]}
  </h3>
            <Link href={`/products?id1=${product.id1}`}  >
              <button className="bg-white text-black py-2 px-6 text-lg font-semibold rounded-full hover:bg-gray-200 transition-colors text-center">
                Buy Now
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>

      {/* Product 5 */}
      <section className="flex items-center justify-center bg-white scroll-animate">
        <div className="md:w-full w-full p-4 flex flex-col justify-center items-center text-center" data-aos="fade-up" data-aos-delay="200">
          <p className="text-2xl sm:text-2xl leading-relaxed font-bold text-black pt-10 ">
          At Peros, Believe that great Health starts with great Ingredients. Our Premium Peanut Butter is made from the finest handpicked peanuts found only in the southern part of Asia, ensuring an unmatched taste and nutrition in every spoonful.
          </p>
          
      
         
          <h2 className="text-5xl font-bold text-black">

          </h2>
        </div>
      </section>
      <div className="flex flex-col items-center justify-center mt-10">
  <ExportedImage
    src="/assets/1.png"
    unoptimized={true}
    alt="shivam"
    width={220}
    height={100}
    objectFit="cover"
    className="hidden md:block p-0 m-0 leading-none"
    data-aos="slide-left"
  />
  <ExportedImage
    src="/assets/2.png"
    unoptimized={true}
    alt="shivam"
    width={220}
    height={100}
    objectFit="cover"
    className="hidden md:block p-0 m-0 leading-none"
    data-aos="slide-right"
  />
</div>

<div className="flex flex-col items-center justify-center md:hidden">
  <ExportedImage
    src="/assets/1.png"
    unoptimized={true}
    alt="shivam"
    width={320}
    height={200}
    objectFit="cover"
    className="block p-0 m-0 leading-none"
    
  />
  <ExportedImage
    src="/assets/2.png"
    unoptimized={true}
    alt="shivam"
    width={320}
    height={200}
    objectFit="cover"
    className="block p-0 m-0 leading-none"
   
  />
</div>
<p className="font-poppins font-light text-4xl">grams of <span className="font-bold font-poppins">Protein</span></p>


      <section className="flex justify-center items-center h-full m-8 pb-10">
  <div className="flex gap-8 flex-wrap justify-center">
    {[
      {
        title: "High",
        description: "High Protein Peanuts used Sourced from premium peanuts from south Asia",
      },
      {
        title: "Zero",
        description: "Zero Cholestrol to ensure that peros provide a safe and healthy breakfast",
      },
      {
        title: "High",
        description: "Contains high fiber to maintain good gut health and digestion",
      },
      {
        title: "Zero",
        description: " Zero addatives on classic raw to provide you a spoon full of natural peanuts",
      },
    ].map((item, index) => (
      <div className="text-center" key={index}>
        <div
          className="inline-flex items-center justify-center border-4 border-r-transparent border-black rounded-full px-6 py-1 text-black font-bold text-2xl mb-2"
        
        >
          <h4>{item.title}</h4>
        </div>
        <div className="text-black text-base font-bold">
          <p>{item.description}</p>
        </div>
      </div>
    ))}
  </div>
</section>
<Footer/>



    </div>
  );
};

export default Content;

