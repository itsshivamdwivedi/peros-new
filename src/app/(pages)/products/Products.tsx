"use client";

import Image from "next/image";
import React, {  useRef, useState } from "react";
import { useCart } from "@/contexts/CartContext"; 
import gsap from "gsap";
import Link from "next/link";
import ScrollTrigger from "gsap/ScrollTrigger";
import { v4 as uuidv4 } from "uuid";
import Footer from "@/components/Footer";
import { useRouter, useSearchParams } from "next/navigation"; 


//hello1


import { FaStar, FaChevronLeft, FaChevronRight, FaStarHalfAlt } from "react-icons/fa";
import { useEffect} from "react";
import { useParams } from "next/navigation";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";


interface Review {
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  timestamp: Timestamp;
  imageURLs?: string[]; // optional field for image links
}



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
  id1:number;
 
  detailedDescription: string;
  detailedDescription2: string;
  detailedDescription3: string;
  shelfLife: string;
};

const peanutButterVariants: Variant[] = [
  {
    id: uuidv4(),
    id1:1,
    name: "Classic Creamy",
    images: [
      "/assets/jar 3.png",
      "/assets/slider-01-min.jpg",
      "/assets/slider-02-min.jpg",
      "/assets/slider-03-min.jpg"
    ],
    description:
      "Peros Classic Creamy Peanut Butter is crafted for those who love a smooth, rich spread without any compromise on quality. Made from premium-grade roasted peanuts, this variant delivers a naturally delicious flavor with a velvety texture that melts on your tongue.",
    detailedDescription:
      "At Peros, we produce all our nut butters in an FSSAI approved and ISO 22000 certified facility, ensuring the highest food safety and nutritional standards.",
    detailedDescription2:
      "Freshly made in small batches daily, our butters are suitable for kids, adults, and the health-conscious alike.",
    detailedDescription3:
      "Perfect for daily snacking, breakfast, or as a versatile ingredient in your kitchen.",
    shelfLife: "12 Months",
    sizes: [
      { label: "350g", price: 175, pricel: 200 },
      { label: "1kg", price: 475, pricel: 500 },
    ],
  },
  {
    id: uuidv4(),
    id1:2,
    name: "Crunchy Honey",
    images: [
      "/assets/jar 2.png",
      "/assets/slider-01-min.jpg",
      "/assets/slider-02-min.jpg",
      "/assets/slider-03-min.jpg"
    ],
    description:
      "Chunky texture with real peanut bits and a touch of honey for natural sweetness.",
    detailedDescription:
      "Peros Crunchy Honey Peanut Butter combines roasted peanuts with natural honey and crunchy peanut bits, offering a textured and flavorful experience with every bite.",
    detailedDescription2:
      "Manufactured in our state-of-the-art ISO 22000 and FSSAI certified plant, each jar is made with love, quality, and cleanliness at the forefront.",
    detailedDescription3:
      "Our commitment to freshness means every batch is made daily and delivered straight to you with full flavor intact.",
    shelfLife: "12 Months",
    sizes: [
      { label: "350g", price: 170, pricel: 200 },
      { label: "1kg", price: 500, pricel: 550 },
    ],
  },
  {
    id: uuidv4(),
    id1:3,
    name: " Dark Chocolate Crunchy",
    images: [
      "/assets/jar 1.png",
      "/assets/slider-01-min.jpg",
      "/assets/slider-02-min.jpg",
      "/assets/slider-03-min.jpg"
    ],
    description:
      "A blend of peanuts, dark cocoa, and sea salt for a rich, indulgent flavor.",
    detailedDescription:
      "Peros High Protein Dark Chocolate Crunchy Peanut Butter is a powerful blend of dark cocoa, roasted peanuts, and imported whey protein — designed for fitness enthusiasts and chocolate lovers.",
    detailedDescription2:
      "Crafted in our ISO 22000 certified and FSSAI approved facility, every jar upholds the highest standards of hygiene, quality, and freshness.",
    detailedDescription3:
      "We make our protein-packed peanut butters in fresh batches daily to lock in maximum taste and nutrition.",
    shelfLife: "12 Months",
    sizes: [
      { label: "350g", price: 299, pricel: 999 },
      { label: "1kg", price: 525, pricel: 600 }
    ],
  }
];




const Products: React.FC = () => {
  const [quantity, setQuantity] = useState(1);
    const productDetailRef = useRef<HTMLDivElement>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant>(
    peanutButterVariants[0]
  );

  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const [currentImage, setCurrentImage] = useState<string>(
    selectedVariant.images[0]
  );
  const [selectedSize, setSelectedSize] = useState<Size>(
    selectedVariant.sizes[0]
  );
  const [showPopup, setShowPopup] = useState(false);
  const params = useParams();
    const rawSlug = params?.slug;
    const productId = typeof rawSlug === "string" ? rawSlug : rawSlug?.[0] || "default";
  
    const [reviews, setReviews] = useState<Review[]>([]);
    const [rating, setRating] = useState<number>(5);
    const [comment, setComment] = useState("");
    const [user, setUser] = useState<any>(null);
    const [hasReviewed, setHasReviewed] = useState(false);
    const [averageRating, setAverageRating] = useState<number>(0);
    const [showAllReviews, setShowAllReviews] = useState(false);

const [reviewCount, setReviewCount] = useState<number>(0);

const storage = getStorage();


  
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
      });
      return () => unsubscribe();
    }, []);
  
    useEffect(() => {
      if (productId) {
        fetchReviews();
      }
    }, [productId, user]);
    const fetchReviews = async () => {
  try {
    const reviewRef = collection(db, "products", productId, "reviews");
    const reviewSnap = await getDocs(reviewRef);
    const fetched: Review[] = [];

    let total = 0;

    reviewSnap.forEach((doc) => {
      const data = doc.data() as Review;
      fetched.push(data);
      total += data.rating;
      if (user && data.userId === user.uid) {
        setHasReviewed(true);
      }
    });

    setReviews(fetched);
    setReviewCount(fetched.length);
    setAverageRating(fetched.length > 0 ? total / fetched.length : 0);
  } catch (error) {
    console.error("Error fetching reviews:", error);
  }
};

  
    // const fetchReviews = async () => {
    //   try {
    //     const reviewRef = collection(db, "products", productId, "reviews");
    //     const reviewSnap = await getDocs(reviewRef);
    //     const fetched: Review[] = [];
  
    //     reviewSnap.forEach((doc) => {
    //       const data = doc.data() as Review;
    //       fetched.push(data);
    //       if (user && data.userId === user.uid) {
    //         setHasReviewed(true);
    //       }
    //     });
  
    //     setReviews(fetched);
    //   } catch (error) {
    //     console.error("Error fetching reviews:", error);
    //   }
    // };
  
// Review Submit Handler


const [thankYouPopup, setThankYouPopup] = useState(false);
const handleSubmit = async () => {
  if (!user || hasReviewed || comment.trim() === "") return;

  try {
    const imageURLs: string[] = [];

    for (const image of selectedImages) {
      const imageRef = ref(storage, `reviews/${productId}/${user.uid}/${image.name}`);
      const snapshot = await uploadBytes(imageRef, image);
      const url = await getDownloadURL(snapshot.ref);
      imageURLs.push(url);
    }

    const reviewData: Review = {
      userId: user.uid,
      userName: user.displayName || user.email || "Anonymous",
      rating: Math.max(1, Math.min(5, rating)),
      comment,
      timestamp: Timestamp.now(),
      imageURLs,
    };

    const reviewRef = collection(db, "products", productId, "reviews");
    await addDoc(reviewRef, reviewData);

    // Reset form
    setComment("");
    setRating(5);
    setSelectedImages([]);
    setHasReviewed(true);
     setShowReviewPopup(true)

    // Show thank you modal
    setThankYouPopup(true);

    await fetchReviews(); // Refresh UI

  } catch (error) {
    console.error("Error submitting review:", error);
    alert("Something went wrong. Please try again.");
  }
};


  const { addToCart } = useCart(); 
  const [showReviewPopup, setShowReviewPopup] = useState(false); // ✅ distinct from cart


  const [variantSelections, setVariantSelections] = useState<Record<string, string>>({});

const handleSizeChange = (variantId: string, sizeLabel: string) => {
  setVariantSelections((prev) => ({ ...prev, [variantId]: sizeLabel }));
};

  const handleVariantClick = (variantId: string) => {
    const variant = peanutButterVariants.find((v) => v.id === variantId);
    if (variant) {
      setSelectedVariant(variant);
      setCurrentImage(variant.images[0]);
      setSelectedSize(variant.sizes[0]);
    }
  };


   const handleVariantClick2 = (variant: Variant, sizeOverride?: Size) => {
    setSelectedVariant(variant);
    setCurrentImage(variant.images[0]);
    setSelectedSize(sizeOverride || variant.sizes[0]);
    setQuantity(1);

    // Scroll to top of product detail view
    setTimeout(() => {
      productDetailRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
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
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 2500);

  };


    const searchParams = useSearchParams();
  const id1Param = searchParams.get("id1");

  useEffect(() => {
    if (id1Param) {
      const id1Num = parseInt(id1Param, 10);
      const foundVariant = peanutButterVariants.find(
        (variant) => variant.id1 === id1Num
      );
      if (foundVariant) {
        setSelectedVariant(foundVariant);
        setCurrentImage(foundVariant.images[0]);
        setSelectedSize(foundVariant.sizes[0]);
        setQuantity(1);
      }
    }
  }, [id1Param]);

  if (!selectedVariant) {
    return <p>Loading product...</p>;
  }

  return (
    <div className="w-full  lg:sticky top-20 max-h-screen overflow-auto relative z-10 sm:mt-4 ">
      {showPopup && (
  <div className="fixed top-52 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-2 rounded shadow-md transition-all duration-300">
    Successfully added product to the cart!
  </div>
)}
      
      <div className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 flex flex-col lg:flex-row xl:mt-10  mt-4  " ref={productDetailRef}>
      
        <div className="w-full lg:w-1/2  lg:sticky top-20 h-max" >
          <div className="h-[400px]  relative sm:mb-[10vh]">
            <Image
              src={currentImage}
              width={400}
              height={400}
              alt={selectedVariant.name}
              // fill
              className="object-cover rounded-md "
              

            />
          </div>
          <div className="flex mt-4 sm:mr-[2vw]">
            {selectedVariant.images.map((image, index) => (
              <Image
              width={80}
              height={80}
                key={`${selectedVariant.id}-image-${index}`}
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className={`w-1/4 h-32 px-1 mt-8 rounded cursor-pointer object-contain transition-transform duration-300 transform hover:scale-110 ${
                  currentImage === image ? "" : "opacity-40"
                }`}
                onClick={() => setCurrentImage(image)}
              />
            ))}
          </div>
        </div>

        <div className="w-full lg:w-1/2 xl:mt-16 mt-10 "  >
          <h1 className="text-3xl font-semibold mb-1 font-sans">{selectedVariant.name}</h1>
          {/* <p className="text-lg text-gray-500 mb-4 ">{selectedVariant.description}</p> */}
         <h2 className="text-sm font-semibold flex text-yellow-200 mb-5 items-center">
  {[...Array(5)].map((_, index) => (
    <FaStar
      key={index}
      className={index < Math.round(averageRating) ? "text-yellow-400" : "text-gray-300"}
    />
  ))}
  <span className="text-gray-300 text-sm px-2">
    ({reviewCount} Review{reviewCount !== 1 ? "s" : ""})
  </span>
</h2>
<h2 className="text-3xl font-semibold">
            ₹{selectedSize.price} <span className="text-red-500 font-medium text-sm">-10%</span>
          </h2>
          <div className="flex flex-col items-start gap-1 ">
            <h3 className="line-through text-gray-400">M.R.P: ₹{selectedSize.pricel}</h3>
            <h3 className="text-black font-sans">Tax included</h3>
          </div>

          

          <div className="flex flex-col gap-4 mt-4">
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
         {selectedVariant && (
   <div className="mt-4 space-y-3 text-left">
  <p>{selectedVariant.detailedDescription}</p>
  <p>{selectedVariant.description}</p>
  <p>{selectedVariant.detailedDescription2}</p>
  <p>{selectedVariant.detailedDescription3}</p>
  <p className="text-green-600">{selectedVariant.shelfLife}</p>
</div>
)}
<div className="px-[20vw] m-3"><div className="border-b-4 border-green-500 ..."></div>
      

      </div></div>


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
         We source handpicked, high-quality peanuts from the <span className="font-semibold">southern regions of Asia -</span>renowned for their rich flavour and smooth texture. Combined with luxury-grade cocooa. every spoonful delivers a silky-smooth experience that melts effortlessy on your palate
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
      <div className="absolute top-0 left-0 w-full md:h-[250px] bg-contain bg-no-repeat h-full  sm:absolute sm:-z-10   " > <img src="/assets/gradient 3-022.png" className="hidden sm:inline" alt=""  />  <img src="/assets/gradient 3-02.png" className="sm:hidden" alt=""  /></div>
     
      
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



  {/* Add Review Button */}
<div className="my-6 flex justify-center">
  {user && !hasReviewed ? (
    <button
      onClick={() =>  setShowReviewPopup(true)}
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-orange-400"
    >
      Add a Review
    </button>
  ) : user && hasReviewed ? (
    <p className="text-green-600">You’ve already reviewed this product.</p>
  ) : (
    <p className="text-red-600">Please log in to write a review.</p>
  )}
</div>

{/* Review Modal */}
{showReviewPopup && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center px-5 z-50">
    <div className="bg-white p-6 rounded-lg max-w-lg w-full relative">
      <button
        onClick={() =>  setShowReviewPopup(false)}
        className="absolute top-2 right-3 text-xl text-gray-500 hover:text-black"
      >
        &times;
      </button>

      <h3 className="text-lg font-bold mb-4">Write a Review</h3>

      {/* Star Rating */}
      <label className="block mb-4">
        <span className="text-sm block mb-1">Rating:</span>
        <div className="flex gap-1 text-yellow-400 text-2xl cursor-pointer">
          {[1, 2, 3, 4, 5].map((num) => (
            <span
              key={num}
              onClick={() => setRating(num)}
              className={num <= rating ? "text-yellow-400" : "text-gray-300"}
            >
              ★
            </span>
          ))}
        </div>
      </label>

      {/* Comment */}
      <label className="block r mb-4">
        <span className="text-sm block mb-1">Your Comment:</span>
        <textarea
          className="w-full border p-2 rounded"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </label>

    

      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white px-4 py-2 rounded flex justify-center hover:bg-orange-500 w-full"
      >
        Submit Review
      </button>
    </div>
  </div>
)}


<div className="mt-12 px-3 md:px-[20vw]">
  <h2 className="text-3xl  flex justify-center font-extrabold mb-8 text-gray-800 tracking-tight">
  Customer Reviews
  </h2>

  {reviews.length === 0 ? (
    <p className="text-gray-500 italic text-center">
      Be the first to review this product.
    </p>
  ) : (
    <>
      {(showAllReviews ? reviews : reviews.slice(0, 6)).map((r, idx) => {
        const initials = r.userName
          ?.split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase();

        return (
          <div
            key={idx}
            className="bg-white p-6 rounded-3xl  shadow-xl border border-gray-100 mb-8 relative transition-transform transform hover:scale-[1.02]"
          >
            {/* Header */}
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold shadow-md mr-4">
                {initials}
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {r.userName}
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2v-5H3v5a2 2 0 002 2z"
                    />
                  </svg>
                  {r.timestamp?.toDate?.().toLocaleDateString() ?? "Unknown date"}
                </div>
              </div>
              <div className="ml-auto bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                {r.rating} / 5
              </div>
            </div>

            {/* Star Rating */}
            <div className="flex items-center mb-3 gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-5 h-5 transition-all ${
                    star <= r.rating
                      ? "text-yellow-400 scale-110 drop-shadow-sm"
                      : "text-gray-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927a1 1 0 011.902 0l1.286 3.957a1 1 0 00.95.69h4.167c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.538 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.783.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.075 9.384c-.783-.57-.38-1.81.588-1.81h4.167a1 1 0 00.951-.69l1.268-3.957z" />
                </svg>
              ))}
            </div>

            {/* Comment */}
            <blockquote className="italic text-gray-700 relative pl-6 border-l-4 border-gray-300">
              <span className="absolute text-3xl left-0 top-[-12px] text-gray-400 font-serif">“</span>
              {r.comment}
            </blockquote>

            {/* Images */}
            {Array.isArray(r.imageURLs) && r.imageURLs.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-4">
                {r.imageURLs.map((url, i) => (
                  <div
                    key={i}
                    className="w-24 h-24 rounded-xl overflow-hidden shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300 border border-gray-200"
                  >
                    <img
                      src={url}
                      alt={`Review image ${i + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Show More / Less Button */}
      {reviews.length > 6 && (
        <div className="text-center mt-6">
          <button
            onClick={() => setShowAllReviews((prev) => !prev)}
            className="text-indigo-600 hover:text-indigo-800 underline font-semibold text-sm transition"
          >
            {showAllReviews ? "⬆ Show Less Reviews" : "⬇ Show More Reviews"}
          </button>
        </div>
      )}
    </>
  )}
</div>


{thankYouPopup && (
  <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md text-center animate-fade-in">
      <h2 className="text-2xl font-bold text-green-600 mb-2">Thank You!</h2>
      <p className="text-gray-700 mb-4">Your review is valuable.</p>
      <button
        onClick={() => setThankYouPopup(false)}
        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full transition"
      >
        Close
      </button>
    </div>
  </div>
)}




  <div className="sm:bg-white ">
    {/* OTHER VARIANTS */}
   <div className="mt-20 ">
  <div className="text-xl flex justify-center font-bold mb-6 sm:text-3xl">You May Also Like</div>
  <div className="px-[20vw]  m-3  ">
    <div className="border-b-4 sm:hidden  border-green-500"></div>
    <div className="border-b-8 ml-23 mr-23 hidden sm:inline border-green-500"></div>
  </div>

  {/* Horizontal scroll area */}
  <div className="w-full flex  overflow-x-auto  scroll-hide sm:mt-10 ">
    <div className="flex sm:flex-col gap-6  sm:gap-14 px-4 sm:ml-[25vw] ">
      {peanutButterVariants.map((variant) => {
        const selectedLabel = variantSelections[variant.id] || variant.sizes[0].label;
        const selectedSize = variant.sizes.find((s) => s.label === selectedLabel)!;

        return (
          <div
            key={variant.id}
            className="min-w-[45vw] max-w-[45vw]  border rounded-lg p-4 shadow hover:shadow-md"
          >
            <img
              src={variant.images[0]}
              alt={variant.name}
              className="w-32 h-32 sm:h-[35vh] sm:w-[35] mx-auto object-contain mb-2"
            />
            <h3 className="text-center font-semibold mb-1 sm:text-3xl">{variant.name}</h3>

            <select
              className="w-[20vw] px-2 ml-6 py-1 mt-1 sm:mt-5 border rounded mb-3 sm:ml-[19vw] sm:w-[5vw]"
              value={selectedLabel}
              onChange={(e) => handleSizeChange(variant.id, e.target.value)}
            >
              {variant.sizes.map((size) => (
                <option key={size.label} value={size.label}>
                  {size.label}
                </option>
              ))}
            </select>

            <div className="text-center text-lg  font-semibold text-green-600">
              ₹{selectedSize.price}
              <span className="text-sm text-gray-400 line-through ml-2">
                ₹{selectedSize.pricel}
              </span>
            </div>

            <button
              onClick={() => handleVariantClick2(variant, selectedSize)}
              className="w-full mt-2 sm:w-[25vw] sm:ml-[8vw] bg-green-500 sm:mt-5 text-white py-1 rounded hover:bg-green-600"
            >
              Buy
            </button>
          </div>
        );
      })}
    </div>
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
   
   
 
    


   </div>



  );
};

export default Products;
