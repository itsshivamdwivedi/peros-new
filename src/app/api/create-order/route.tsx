// File: /app/api/create-order/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// ✅ Required Environment Variables12
const {
  PHONEPE_SALT_KEY,
  PHONEPE_SALT_INDEX,
  PHONEPE_MERCHANT_ID,
  NEXT_PUBLIC_BASE_URL,
} = process.env;

const PHONEPE_API_BASE_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const API_ENDPOINT_PATH = "/pg/v1/pay";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, orderId, redirectUrl } = body;

    if (!amount || !orderId || !redirectUrl) {
      return NextResponse.json(
        { error: "Missing required fields", fields: { amount, orderId, redirectUrl } },
        { status: 400 }
      );
    }

    const payload = {
      merchantId: PHONEPE_MERCHANT_ID,
      merchantTransactionId: orderId,
      merchantUserId: "user-123",
      amount: amount * 100, // ₹ to paise
      redirectUrl,
      redirectMode: "REDIRECT",
      callbackUrl: `${NEXT_PUBLIC_BASE_URL}/api/payment-callback`,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
      mobileNumber: "9999999999",
    };

    const payloadStr = JSON.stringify(payload);
    const base64Payload = Buffer.from(payloadStr).toString("base64");

    const signatureRaw = `${base64Payload}${API_ENDPOINT_PATH}${PHONEPE_SALT_KEY}`;
    const hash = crypto.createHash("sha256").update(signatureRaw).digest("hex");
    const xVerify = `${hash}###${PHONEPE_SALT_INDEX}`;

    const phonepeRes = await fetch(`${PHONEPE_API_BASE_URL}${API_ENDPOINT_PATH}`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
        "X-MERCHANT-ID": PHONEPE_MERCHANT_ID!,
      },
      body: JSON.stringify({ request: base64Payload }),
    });

    const responseText = await phonepeRes.text();

    if (!phonepeRes.ok) {
      console.error("❌ PhonePe API Error:", responseText);
      return NextResponse.json(
        { error: "PhonePe request failed", details: JSON.parse(responseText) },
        { status: phonepeRes.status }
      );
    }

    const result = JSON.parse(responseText);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("❌ Internal Server Error:", err.message || err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
