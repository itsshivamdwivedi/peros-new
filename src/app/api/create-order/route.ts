// import axios from 'axios';
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// interface PaymentRequestBody {
//   amount: number;
//   orderId?: string;
//   metaInfo?: {
//     udf1?: string;
//     udf2?: string;
//     udf3?: string;
//     udf4?: string;
//     udf5?: string;
//   };
// }

// interface TokenResponse {
//   access_token: string;
// }

// export async function POST(req: NextRequest) {
//   const {
//     CLIENT_ID,
//     CLIENT_SECRET,
//     CLIENT_VERSION,
//     ENV_URL,
//     REDIRECT_URL,
//   } = process.env;

//   if (!CLIENT_ID || !CLIENT_SECRET || !CLIENT_VERSION || !ENV_URL || !REDIRECT_URL) {
//     console.error("❌ Missing environment variables");
//     return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
//   }

//   const body: PaymentRequestBody = await req.json();
//   console.log("📥 Incoming Payment Request:", body);

//   const { amount, orderId, metaInfo } = body;

//   if (!amount || amount <= 0) {
//     console.warn("⚠️ Invalid amount received:", amount);
//     return NextResponse.json({ error: "Invalid amount provided" }, { status: 400 });
//   }

//   const transactionId = orderId || `txn_${Date.now()}`;
//   console.log("🆔 Using Transaction ID:", transactionId);

//   try {
//     // Step 1: Get OAuth token
//     const formData = new URLSearchParams();
//     formData.append('grant_type', 'client_credentials');
//     formData.append('client_id', CLIENT_ID);
//     formData.append('client_secret', CLIENT_SECRET);
//     formData.append('client_version', CLIENT_VERSION);

//     const tokenRes = await axios.post<TokenResponse>(
//       `${ENV_URL}/v1/oauth/token`,
//       formData,
//       { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
//     );

//     const { access_token } = tokenRes.data;
//     console.log("🔐 OAuth Access Token:", access_token);

//     // Step 2: Create Payment
//     const paymentPayload = {
//       merchantOrderId: transactionId,
//       amount: amount,
//       expireAfter: 1200,
//       metaInfo: {
//         udf1: metaInfo?.udf1 || '',
//         udf2: metaInfo?.udf2 || '',
//         udf3: metaInfo?.udf3 || '',
//         udf4: metaInfo?.udf4 || '',
//         udf5: metaInfo?.udf5 || '',
//       },
//       paymentFlow: {
//         type: 'PG_CHECKOUT',
//         message: 'PhonePe Standard Checkout',
//         merchantUrls: {
//           redirectUrl: REDIRECT_URL,
//         },
//       },
//     };

//     console.log("📦 Sending Payment Payload:", paymentPayload);

//     const paymentRes = await axios.post(
//       `${ENV_URL}/checkout/v2/pay`,
//       paymentPayload,
//       {
//         headers: {
//           Authorization: `O-Bearer ${access_token}`,
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     console.log("✅ PhonePe Payment Response:", paymentRes.data);

//     const redirectUrl = paymentRes.data?.redirectUrl;
//     if (!redirectUrl) {
//       console.error("❌ No redirect URL in PhonePe response");
//       return NextResponse.json({ error: "Invalid payment response" }, { status: 502 });
//     }

//     return NextResponse.json({
//       url: redirectUrl,
//       transactionId,
//     });
//   } catch (err: any) {
//     console.error('❌ PhonePe Error:', err.response?.data || err.message);
//     return NextResponse.json(
//       {
//         error: 'Payment failed',
//         details: err.response?.data || err.message,
//       },
//       { status: 500 }
//     );
//   }
// }



import axios from 'axios';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface PaymentRequestBody {
  amount: number;
  orderId?: string;
  metaInfo?: {
    udf1?: string;
    udf2?: string;
    udf3?: string;
    udf4?: string;
    udf5?: string;
  };
}

interface TokenResponse {
  access_token: string;
}

export async function POST(req: NextRequest) {
  const {
    CLIENT_ID,
    CLIENT_SECRET,
    CLIENT_VERSION,
    AUTH_URL,
    PG_URL,
    REDIRECT_URL,
    MERCHANT_ID,
  } = process.env;

  // ✅ Validate all required env variables
  if (!CLIENT_ID || !CLIENT_SECRET || !CLIENT_VERSION || !AUTH_URL || !PG_URL || !REDIRECT_URL || !MERCHANT_ID) {
    console.error("❌ Missing environment variables");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const body: PaymentRequestBody = await req.json();
  console.log("📥 Incoming Payment Request:", body);

  const { amount, orderId, metaInfo } = body;

  // ✅ Validate amount
  if (!amount || amount <= 0) {
    console.warn("⚠️ Invalid amount received:", amount);
    return NextResponse.json({ error: "Invalid amount provided" }, { status: 400 });
  }

  const transactionId = orderId || `txn_${Date.now()}`;
  console.log("🆔 Using Transaction ID:", transactionId);

  try {
    // 🔐 Step 1: Get OAuth token from PhonePe Auth API
    const formData = new URLSearchParams();
    formData.append('grant_type', 'client_credentials');
    formData.append('client_id', CLIENT_ID);
    formData.append('client_secret', CLIENT_SECRET);
    formData.append('client_version', CLIENT_VERSION);

    const tokenRes = await axios.post<TokenResponse>(
      `${AUTH_URL}/v1/oauth/token`,
      formData,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token } = tokenRes.data;
    console.log("🔐 OAuth Access Token:", access_token) ;

    // 💳 Step 2: Create Payment
    const paymentPayload = {
      merchantId: MERCHANT_ID,
      merchantOrderId: transactionId,
      amount: amount,
      expireAfter: 1200,
      metaInfo: {
        udf1: metaInfo?.udf1 || '',
        udf2: metaInfo?.udf2 || '',
        udf3: metaInfo?.udf3 || '',
        udf4: metaInfo?.udf4 || '',
        udf5: metaInfo?.udf5 || '',
      },
      paymentFlow: {
        type: 'PG_CHECKOUT',
        message: 'PhonePe Standard Checkout',
        merchantUrls: {
          redirectUrl: REDIRECT_URL,
        },
      },
    };

    console.log("📦 Sending Payment Payload:", paymentPayload);

    const paymentRes = await axios.post(
      `${PG_URL}/checkout/v2/pay`,
      paymentPayload,
      {
        headers: {
          Authorization: `O-Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log("✅ PhonePe Payment Response received");

    const redirectUrl = paymentRes.data?.redirectUrl;

    if (!redirectUrl) {
      console.error("❌ No redirect URL found in PhonePe response");
      return NextResponse.json({ error: "Invalid payment response from PhonePe" }, { status: 502 });
    }

    return NextResponse.json({
      url: redirectUrl,
      transactionId,
    });

  } catch (err: any) {
    console.error('❌ PhonePe Payment Error:', err.response?.data || err.message);
    return NextResponse.json(
      {
        error: 'Payment initiation failed',
        details: err.response?.data || err.message,
      },
      { status: 500 }
    );
  }
}

















// import axios from "axios";
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   console.log("===========================\n STEP 1: Requesting OAuth Token\n===========================");

//   try {
//     const { CLIENT_ID, CLIENT_SECRET, CLIENT_VERSION, PG_URL, REDIRECT_URL } = process.env;

//     if (!CLIENT_ID || !CLIENT_SECRET || !CLIENT_VERSION || !PG_URL || !REDIRECT_URL) {
//       console.error("Missing environment variables");
//       return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
//     }

//     const body = await req.json();
//     const { orderId, amount } = body;

//     if (!amount || amount <= 0) {
//       return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
//     }

//     const txnId = orderId || `txn_${Date.now()}`;

//     // -------------------------------
//     // STEP 1: Get OAuth token
//     // -------------------------------
//     const tokenForm = new URLSearchParams();
//     tokenForm.append("grant_type", "client_credentials");
//     tokenForm.append("client_id", CLIENT_ID);
//     tokenForm.append("client_secret", CLIENT_SECRET);
//     tokenForm.append("client_version", CLIENT_VERSION);

//     console.log("📤 OAuth Request Payload:", Object.fromEntries(tokenForm.entries()));

//     const tokenRes = await axios.post(`${PG_URL}/v1/oauth/token`, tokenForm.toString(), {
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//     });

//     const accessToken = tokenRes.data?.access_token;
//     if (!accessToken) {
//       console.error("❌ No access token received:", tokenRes.data);
//       return NextResponse.json({ error: "Auth failed" }, { status: 502 });
//     }

//     console.log("✅ OAuth Response:", tokenRes.data);
//     console.log("✅ JWT Token for /pay:", accessToken);

//     // -------------------------------
//     // STEP 2: Call /checkout/v2/pay (JSON body)
//     // -------------------------------
//     console.log("\n===========================\n STEP 2: Calling /checkout/v2/pay\n===========================");

//     const payPayload = {
//       token: accessToken,
//       merchantOrderId: txnId,
//       amount: amount,
//       paymentFlow: {
//         type: "PG_CHECKOUT",
//         merchantUrls: { redirectUrl: REDIRECT_URL },
//       },
//     };

//     console.log("📤 Pay API JSON Body:", payPayload);

//     const payRes = await axios.post(`${PG_URL}/checkout/v2/pay`, payPayload, {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `O-Bearer ${accessToken}`,
//       },
//     });

//     console.log("✅ /pay Response:", payRes.data);

//     const redirectUrl =
//       payRes.data?.redirectUrl ||
//       payRes.data?.data?.redirectUrl ||
//       payRes.data?.instrumentResponse?.redirectInfo?.url ||
//       REDIRECT_URL;

//     console.log("💻 Final Redirect URL:", redirectUrl);

//     return NextResponse.json({
//       success: true,
//       transactionId: txnId,
//       url: redirectUrl,
//       rawResponse: payRes.data,
//     });
//   } catch (err: any) {
//     console.error("❌ FINAL ERROR:", err.response?.data || err.message);
//     return NextResponse.json(
//       {
//         success: false,
//         error: err.response?.data || err.message,
//       },
//       { status: 500 }
//     );
//   }
// }
