"use client";

import { useEffect, useState } from "react";
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

interface Review {
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  timestamp: Timestamp;
}

const ReviewPage = () => {
  const params = useParams();
  const rawSlug = params?.slug;
  const productId = typeof rawSlug === "string" ? rawSlug : rawSlug?.[0] || "default";

  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [user, setUser] = useState<any>(null);
  const [hasReviewed, setHasReviewed] = useState(false);

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

      reviewSnap.forEach((doc) => {
        const data = doc.data() as Review;
        fetched.push(data);
        if (user && data.userId === user.uid) {
          setHasReviewed(true);
        }
      });

      setReviews(fetched);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleSubmit = async () => {
    if (!user || hasReviewed) return;

    const reviewData: Review = {
      userId: user.uid,
      userName: user.displayName || user.email,
      rating,
      comment,
      timestamp: Timestamp.now(),
    };

    try {
      const reviewRef = collection(db, "products", productId, "reviews");
      await addDoc(reviewRef, reviewData);
      setHasReviewed(true);
      setComment("");
      fetchReviews();
    } catch (error) {
      console.error("Error adding review:", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h2 className="text-xl font-bold">Product Reviews</h2>

      {/* Review Form */}
      {user ? (
        hasReviewed ? (
          <p className="text-green-600">You’ve already reviewed this product.</p>
        ) : (
          <div className="space-y-2">
            <label className="block">
              <span className="text-sm">Rating (1-5):</span>
              <input
                type="number"
                min={1}
                max={5}
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="border px-2 py-1 w-20 ml-2"
              />
            </label>
            <label className="block">
              <span className="text-sm">Your Comment:</span>
              <textarea
                className="w-full border p-2"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </label>
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Submit Review
            </button>
          </div>
        )
      ) : (
        <p className="text-red-600">Please log in to write a review.</p>
      )}

      {/* Reviews List */}
      <div className="mt-6">
        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          reviews.map((r, idx) => (
            <div key={idx} className="border p-4 rounded mb-4 bg-gray-50">
              <div className="font-bold">{r.userName}</div>
              <div className="text-yellow-500">Rating: {r.rating}/5</div>
              <div>{r.comment}</div>
              <div className="text-xs text-gray-500">
                {r.timestamp.toDate().toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewPage;
