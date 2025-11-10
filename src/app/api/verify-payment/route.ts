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
  const { transactionId } = await req.json();

  if (!transactionId) {
    return NextResponse.json({ error: "Missing transactionId" }, { status: 400 });
  }

  const { CLIENT_ID, CLIENT_SECRET, CLIENT_VERSION, ENV_URL } = process.env;

  if (!CLIENT_ID || !CLIENT_SECRET || !CLIENT_VERSION || !ENV_URL) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  try {
    console.log("\n===========================\n STEP 1: Requesting OAuth Token\n===========================");

    // Step 1: Get OAuth token
    const tokenForm = new URLSearchParams();
    tokenForm.append("grant_type", "client_credentials");
    tokenForm.append("client_id", CLIENT_ID);
    tokenForm.append("client_secret", CLIENT_SECRET);
    tokenForm.append("client_version", CLIENT_VERSION);

    console.log("📤 OAuth Request Payload:", Object.fromEntries(tokenForm.entries()));

    const tokenRes = await axios.post<TokenResponse>(
      `${ENV_URL}/v1/oauth/token`,
      tokenForm.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const accessToken = tokenRes.data?.access_token;
    console.log("✅ OAuth Response:", tokenRes.data);

    if (!accessToken) {
      return NextResponse.json({ error: "Failed to get access token" }, { status: 502 });
    }

    console.log("\n===========================\n STEP 2: Getting Payment Status\n===========================");

    // Step 2: Get Payment Status
    const statusRes = await axios.get(`${ENV_URL}/checkout/v2/order/${transactionId}/status`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `O-Bearer ${accessToken}`,
      },
    });

    const responseData = statusRes.data;
    console.log("✅ PhonePe Status Response:", JSON.stringify(responseData, null, 2));

    // Normalize status
    let paymentStatus: "SUCCESS" | "PENDING" | "FAILED" | "UNKNOWN" = "UNKNOWN";

    const code = responseData?.code;
    const state = responseData?.state;
    const success = responseData?.success;

    if (
      code === "PAYMENT_SUCCESS" ||    // Production success
      code === "SUCCESS" ||            // UAT success
      state === "COMPLETED" ||         // Production success
      state === "SUCCESS" ||           // UAT success
      success === true
    ) {
      paymentStatus = "SUCCESS";
    } else if (
      code === "PAYMENT_PENDING" ||
      code === "PENDING" ||
      state === "PENDING"
    ) {
      paymentStatus = "PENDING";
    } else if (
      code === "PAYMENT_FAILED" ||
      code === "PAYMENT_ERROR" ||
      code === "FAILED" ||            // UAT failure
      state === "FAILED"
    ) {
      paymentStatus = "FAILED";
    }

    // Return normalized response
    return NextResponse.json({
      success,
      code,
      state,
      status: paymentStatus,
      data: responseData,
    });
  } catch (err: any) {
    console.error("❌ Verification error:", err?.response?.data || err.message);
    return NextResponse.json(
      {
        error: "Verification failed",
        details: err?.response?.data || err?.message,
      },
      { status: 500 }
    );
  }
}
