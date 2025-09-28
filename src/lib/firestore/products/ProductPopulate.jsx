import { useEffect, useState } from 'react';
import { db } from '../../firebase.jsx';
import { collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';

const peanutButterVariants = [
  {
    id: "classic-creamy",
    id1: 2,
    name: "Classic Creamy",
    images: ["/Os Raw.png", "/assets/slider-01-min.jpg", "/assets/slider-02-min.jpg", "/assets/slider-03-min.jpg"],
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
      { label: "350g", price: 175, pricel: 200, inStock: true },
      { label: "1kg", price: 475, pricel: 500, inStock: true },
    ],
  },
  {
    id: "crunchy-honey",
    id1: 1,
    name: "Crunchy Honey",
    images: ["Os Honey.png", "/assets/slider-01-min.jpg", "/assets/slider-02-min.jpg", "/assets/slider-03-min.jpg"],
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
      { label: "350g", price: 170, pricel: 200, inStock: true },
      { label: "1kg", price: 500, pricel: 550, inStock: true },
    ],
  },
  {
    id: "dark-chocolate-crunchy",
    id1: 3,
    name: "Dark Chocolate Crunchy",
    images: ["/assets/jar 1.png", "/assets/slider-01-min.jpg", "/assets/slider-02-min.jpg", "/assets/slider-03-min.jpg"],
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
      { label: "350g", price: 199, pricel: 250, inStock: true },
      { label: "1kg", price: 525, pricel: 600, inStock: true },
    ],
  }
];

const ProductPopulate = () => {
    const [status, setStatus] = useState("Starting product population...");
  const [allProducts, setAllProducts] = useState([]);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const populateProducts = async () => {
      try {
        // Step 1: Delete all existing products
        const snapshot = await getDocs(collection(db, "products"));
        for (const docSnap of snapshot.docs) {
          await deleteDoc(doc(db, "products", docSnap.id));
        }
        setStatus("✅ Deleted all existing products.");

        // Step 2: Add new products with fixed IDs
        for (const variant of peanutButterVariants) {
          const productRef = doc(db, "products", variant.id);
          await setDoc(productRef, variant);
          setStatus(`✅ Added: ${variant.name}`);
        }

        // Step 3: Verify products
        const verifySnap = await getDocs(collection(db, "products"));
        const productList = verifySnap.docs.map(docSnap => {
          const data = docSnap.data();
          return `${data.name} - ID: ${docSnap.id} - Sizes: ${data.sizes.map((s) => s.label).join(", ")}`;
        });
        setAllProducts(productList);

        setStatus("🎉 All products added successfully!");
        setCompleted(true);
      } catch (err) {
        setStatus("❌ Error populating products: " + (errr).message);
        console.error(err);
      }
    };

    populateProducts();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Populating Products</h1>
      <p>{status}</p>
      {completed && <p className="text-green-600 font-semibold">Done! Products are now cleanly added without duplicates.</p>}
      {allProducts.length > 0 && (
        <div className="mt-4">
          <h2 className="font-semibold mb-2">All Products in Firestore</h2>
          <ul className="list-disc pl-6">
            {allProducts.map((p, idx) => (
              <li key={idx}>{p}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProductPopulate;