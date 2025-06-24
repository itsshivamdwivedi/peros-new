// src/app/api/create-order/verify-payment/route.ts

import Razorpay from "razorpay";
import { NextResponse } from "next/server";

// Initialize Razorpay instance with environment variables
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

// POST request handler to verify the payment
export async function POST(req: Request) {
  try {
    // Parse the request body
    const { paymentId, orderId } = await req.json();
    console.log(req.body);

    console.log("Received paymentId:", paymentId);
    console.log("Received orderId:", orderId);

    // Check for missing parameters
    if (!paymentId || !orderId) {
      console.log("Missing paymentId or orderId");
      return NextResponse.json({ error: "Missing paymentId or orderId" }, { status: 400 });
    }

    // Verify the payment using Razorpay's API
    const payment = await razorpayInstance.payments.fetch(paymentId);
    console.log("Payment status:", payment.status);

    // Check if the payment is captured
    if (payment.status === "captured") {
      return NextResponse.json({ success: true, payment });
    } else {
      return NextResponse.json({ error: "Payment failed" }, { status: 400 });
    }
  } catch (error) {
    // Handle any errors that occur
    console.error("Error in payment verification:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
