// // File: /app/api/create-order/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import crypto from "crypto";

// // ✅ Required Environment Variables12
// const {
//   PHONEPE_SALT_KEY,
//   PHONEPE_SALT_INDEX,
//   PHONEPE_MERCHANT_ID,
//   NEXT_PUBLIC_BASE_URL,
// } = process.env;

// const PHONEPE_API_BASE_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
// const API_ENDPOINT_PATH = "/pg/v1/pay";

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { amount, orderId, redirectUrl } = body;

//     if (!amount || !orderId || !redirectUrl) {
//       return NextResponse.json(
//         { error: "Missing required fields", fields: { amount, orderId, redirectUrl } },
//         { status: 400 }
//       );
//     }

//     const payload = {
//       merchantId: PHONEPE_MERCHANT_ID,
//       merchantTransactionId: orderId,
//       merchantUserId: "user-123",
//       amount: amount * 100, // ₹ to paise
//       redirectUrl,
//       redirectMode: "REDIRECT",
//       callbackUrl: `${NEXT_PUBLIC_BASE_URL}/api/payment-callback`,
//       paymentInstrument: {
//         type: "PAY_PAGE",
//       },
//       mobileNumber: "9999999999",
//     };

//     const payloadStr = JSON.stringify(payload);
//     const base64Payload = Buffer.from(payloadStr).toString("base64");

//     const signatureRaw = `${base64Payload}${API_ENDPOINT_PATH}${PHONEPE_SALT_KEY}`;
//     const hash = crypto.createHash("sha256").update(signatureRaw).digest("hex");
//     const xVerify = `${hash}###${PHONEPE_SALT_INDEX}`;

//     const phonepeRes = await fetch(`${PHONEPE_API_BASE_URL}${API_ENDPOINT_PATH}`, {
//       method: "POST",
//       headers: {
//         accept: "application/json",
//         "Content-Type": "application/json",
//         "X-VERIFY": xVerify,
//         "X-MERCHANT-ID": PHONEPE_MERCHANT_ID!,
//       },
//       body: JSON.stringify({ request: base64Payload }),
//     });

//     const responseText = await phonepeRes.text();

//     if (!phonepeRes.ok) {
//       console.error("❌ PhonePe API Error:", responseText);
//       return NextResponse.json(
//         { error: "PhonePe request failed", details: JSON.parse(responseText) },
//         { status: phonepeRes.status }
//       );
//     }

//     const result = JSON.parse(responseText);
//     return NextResponse.json(result);
//   } catch (err: any) {
//     console.error("❌ Internal Server Error:", err.message || err);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }
import { NextRequest, NextResponse } from "next/server";

// ✅ Load required environment variables
const {
  PHONEPE_CLIENT_ID,
  PHONEPE_CLIENT_SECRET,
  PHONEPE_CLIENT_VERSION = "1",
  PHONEPE_MERCHANT_ID,
  PHONEPE_BASE_URL,
  PHONEPE_AUTH_URL,
  NEXT_PUBLIC_BASE_URL,
} = process.env;

if (
  !PHONEPE_CLIENT_ID ||
  !PHONEPE_CLIENT_SECRET ||
  !PHONEPE_MERCHANT_ID ||
  !PHONEPE_BASE_URL ||
  !PHONEPE_AUTH_URL ||
  !NEXT_PUBLIC_BASE_URL
) {
  throw new Error("❌ Missing one or more PhonePe environment variables");
}

// ✅ Helper: Fetch OAuth Token
async function getAccessToken(): Promise<string> {
  const res = await fetch(PHONEPE_AUTH_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clientId: PHONEPE_CLIENT_ID,
      clientSecret: PHONEPE_CLIENT_SECRET,
      clientVersion: PHONEPE_CLIENT_VERSION,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`❌ Failed to get access token: ${error}`);
  }

  const json = await res.json();
  return json?.data?.token;
}

// ✅ POST handler for initiating payment
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

    const token = await getAccessToken();

    const payload = {
      merchantId: PHONEPE_MERCHANT_ID,
      transactionId: orderId,
      merchantOrderId: orderId,
      merchantUserId: "user-123",
      amount: amount * 100,
      redirectUrl,
      callbackUrl: `${NEXT_PUBLIC_BASE_URL}/api/payment-callback`,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    const res = await fetch(`${PHONEPE_BASE_URL}/pay`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-CLIENT-ID": PHONEPE_CLIENT_ID!,
        "X-CLIENT-VERSION": PHONEPE_CLIENT_VERSION!,
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();

    if (!res.ok) {
      console.error("❌ PhonePe API Error:", text);
      return NextResponse.json(
        { error: "PhonePe request failed", details: JSON.parse(text) },
        { status: res.status }
      );
    }

    const json = JSON.parse(text);
    return NextResponse.json(json);
  } catch (err: any) {
    console.error("❌ Internal Error:", err.message || err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
