// import axios from 'axios';
// import { NextRequest, NextResponse } from 'next/server';

// interface TokenResponse {
//   access_token: string;
// }

// export async function GET(req: NextRequest) {
//   const {
//     CLIENT_ID,
//     CLIENT_SECRET,
//     CLIENT_VERSION,
//     ENV_URL
//   } = process.env;

//   const { searchParams } = new URL(req.url);
//   const transactionId = searchParams.get('transactionId');

//   if (!transactionId) {
//     console.error('❌ Missing transactionId in request');
//     return NextResponse.json({ error: 'Missing transactionId' }, { status: 400 });
//   }

//   if (!CLIENT_ID || !CLIENT_SECRET || !CLIENT_VERSION || !ENV_URL) {
//     console.error('❌ Missing required environment variables');
//     return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
//   }

//   console.log('🔍 Verifying transactionId:', transactionId);
//   console.log('🔧 ENV Config:', {
//     CLIENT_ID,
//     CLIENT_VERSION,
//     ENV_URL,
//   });

//   try {
//     // Step 1: Get access token
//     const formData = new URLSearchParams();
//     formData.append('grant_type', 'client_credentials');
//     formData.append('client_id', CLIENT_ID);
//     formData.append('client_secret', CLIENT_SECRET);
//     formData.append('client_version', CLIENT_VERSION);

//     const tokenResponse = await axios.post<TokenResponse>(
//       `${ENV_URL}/v1/oauth/token`,
//       formData,
//       {
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//         },
//       }
//     );

//     const { access_token } = tokenResponse.data;
//     console.log('✅ Access Token acquired successfully');

//     // Step 2: Get payment status
//     const statusUrl = `${ENV_URL}/checkout/v2/order/${transactionId}/status`;

//     const verifyRes = await axios.get(statusUrl, {
//       headers: {
//         Authorization: `O-Bearer ${access_token}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     const responseData = verifyRes.data;
//     console.log('📦 Raw verification response:', JSON.stringify(responseData, null, 2));

//     const paymentState = responseData?.state;
//     const status = paymentState || 'UNKNOWN';

//     if (!paymentState) {
//       console.warn('⚠️ No state returned for transaction. Marking as UNKNOWN.');
//     }

//     console.log('✅ Extracted payment status:', status);

//     return NextResponse.json({
//       status,
//       data: responseData,
//     });

//   } catch (error: any) {
//     console.error('❌ Verification failed:', error?.response?.data || error?.message);
//     return NextResponse.json(
//       {
//         error: 'Verification failed',
//         details: error?.response?.data || error?.message,
//       },
//       { status: 500 }
//     );
//   }
// }

import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

interface TokenResponse {
  access_token: string;
}

export async function POST(req: NextRequest) {
  try {
    const { transactionId } = await req.json();

    if (!transactionId) {
      console.error("❌ Missing transactionId in request body");
      return NextResponse.json({ error: "Missing transactionId" }, { status: 400 });
    }

    const { CLIENT_ID, CLIENT_SECRET, CLIENT_VERSION, ENV_URL } = process.env;

    if (!CLIENT_ID || !CLIENT_SECRET || !CLIENT_VERSION || !ENV_URL) {
      console.error("❌ Server misconfiguration: missing env variables");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    // Step 1: Get OAuth token
    const tokenForm = new URLSearchParams();
    tokenForm.append("grant_type", "client_credentials");
    tokenForm.append("client_id", CLIENT_ID);
    tokenForm.append("client_secret", CLIENT_SECRET);
    tokenForm.append("client_version", CLIENT_VERSION);

    console.log("📤 Requesting OAuth token from PhonePe...");
    const tokenRes = await axios.post<TokenResponse>(
      `${ENV_URL}/v1/oauth/token`,
      tokenForm.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const accessToken = tokenRes.data?.access_token;
    console.log("🔐 Access Token:", accessToken);

    if (!accessToken) {
      console.error("❌ Failed to get access token", tokenRes.data);
      return NextResponse.json({ error: "Failed to get access token" }, { status: 502 });
    }

    // Step 2: Get payment status from PhonePe
    console.log(`📦 Fetching payment status for transactionId=${transactionId}...`);
    const statusRes = await axios.get(`${ENV_URL}/checkout/v2/order/${transactionId}/status`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `O-Bearer ${accessToken}`,
      },
    });

    const data = statusRes.data;
    console.log("📦 Raw PhonePe status response:", JSON.stringify(data, null, 2));

    const code = data?.code;
    const state = data?.state;
    const success = data?.success;

    console.log("🔹 Code:", code, "State:", state, "Success:", success);

    // Step 3: Normalize status
    let paymentStatus: "Order Created" | "PENDING" | "FAILED" | "UNKNOWN" = "UNKNOWN";

    if (
      code === "PAYMENT_SUCCESS" ||
      code === "SUCCESS" ||
      state === "COMPLETED" ||
      state === "SUCCESS" ||
      success === true
    ) {
      paymentStatus = "Order Created";
    } else if (
      code === "PAYMENT_PENDING" ||
      code === "PENDING" ||
      state === "PENDING"
    ) {
      paymentStatus = "PENDING";
    } else if (
      code === "PAYMENT_FAILED" ||
      code === "PAYMENT_ERROR" ||
      code === "FAILED" ||
      state === "FAILED"
    ) {
      paymentStatus = "FAILED";
    }

    console.log("💻 Mapped Payment Status:", paymentStatus);

    return NextResponse.json({
      transactionId,
      status: paymentStatus,
      code,
      state,
      success,
      data, // raw PhonePe response for debugging
    });
  } catch (err: any) {
    console.error("❌ Payment verification error:", err?.response?.data || err.message);
    return NextResponse.json(
      {
        error: "Verification failed",
        details: err?.response?.data || err?.message,
      },
      { status: 500 }
    );
  }
}
