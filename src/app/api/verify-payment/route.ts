// File: app/api/verify-payment/route.ts

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const {
  PHONEPE_MERCHANT_ID,
  PHONEPE_SALT_KEY,
  PHONEPE_SALT_INDEX,
} = process.env;

if (!PHONEPE_MERCHANT_ID || !PHONEPE_SALT_KEY || !PHONEPE_SALT_INDEX) {
  throw new Error("Missing PhonePe environment variables");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  const path = `/pg/v1/status/${PHONEPE_MERCHANT_ID}/${orderId}`;
  const signature = crypto
    .createHash("sha256")
    .update(path + PHONEPE_SALT_KEY)
    .digest("hex");

  const xVerify = `${signature}###${PHONEPE_SALT_INDEX}`;

  try {
    const response = await fetch(`https://api-preprod.phonepe.com/apis/pg-sandbox${path}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-MERCHANT-ID": PHONEPE_MERCHANT_ID || "",
        "X-VERIFY": xVerify,
      } as Record<string, string>, // 👈 This cast resolves the TS error
    });

    const json = await response.json();
    const responseCode = json?.data?.responseCode;
    const status = responseCode === "SUCCESS" ? "SUCCESS" : "FAILED";

    console.log("PhonePe verify status:", responseCode, json);

    return NextResponse.json({ status, data: json?.data });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
