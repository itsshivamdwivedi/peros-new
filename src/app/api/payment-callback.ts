// /pages/api/payment-callback.ts
import { db } from "@/lib/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, Timestamp } from "firebase/firestore";

export default async function handler(req:any, res:any) {
  if (req.method === "POST") {
    const { transactionId, status, phonePeOrderId, userId } = req.body;

    if (!transactionId || !status || !userId) {
      return res.status(400).json({ error: "Missing params" });
    }

    const userRef = doc(db, `users/${userId}`);

    // Remove old entry if exists
    // Note: Firestore doesn't allow arrayRemove by object reference, you may need a custom solution
    // Instead, just push updated object
    await updateDoc(userRef, {
      orders: arrayUnion({
        transactionId,
        phonePeOrderId,
        status,
        updatedAt: Timestamp.now(),
      }),
    });

    return res.status(200).json({ success: true });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
