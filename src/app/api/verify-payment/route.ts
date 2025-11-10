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

  const {
    CLIENT_ID,
    CLIENT_SECRET,
    CLIENT_VERSION,
    AUTH_URL,
    PG_URL,
  } = process.env;

  if (!CLIENT_ID || !CLIENT_SECRET || !CLIENT_VERSION || !AUTH_URL || !PG_URL) {
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 }
    );
  }

  try {
    // ✅ Step 1 — Get Token
    const formData = new URLSearchParams();
    formData.append("grant_type", "client_credentials");
    formData.append("client_id", CLIENT_ID);
    formData.append("client_secret", CLIENT_SECRET);
    formData.append("client_version", CLIENT_VERSION);

    const tokenResponse = await axios.post<TokenResponse>(
      `${AUTH_URL}/v1/oauth/token`,
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token } = tokenResponse.data;

    // ✅ Step 2 — Get Payment Status
    const statusRes = await axios.get(
      `${PG_URL}/checkout/v2/order/${transactionId}/status`,
      {
        headers: {
          Authorization: `O-Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const responseData = statusRes.data;

    console.log(
      "✅ PhonePe Status Response:",
      JSON.stringify(responseData, null, 2)
    );

    const paymentCode = responseData?.code;
    const state = responseData?.state;
    const success = responseData?.success;

    // ✅ Normalize everything
    let paymentStatus = "UNKNOWN";

    if (paymentCode === "PAYMENT_SUCCESS" || state === "COMPLETED" || success === true) {
      paymentStatus = "SUCCESS";
    } else if (paymentCode === "PAYMENT_PENDING" || state === "PENDING") {
      paymentStatus = "PENDING";
    } else if (
      paymentCode === "PAYMENT_FAILED" ||
      paymentCode === "PAYMENT_ERROR" ||
      state === "FAILED"
    ) {
      paymentStatus = "FAILED";
    }

    return NextResponse.json({
      success,
      code: paymentCode,
      state,
      status: paymentStatus,
      data: responseData,
    });
  } catch (error: any) {
    console.error("❌ Verification error:", error?.response?.data || error.message);

    return NextResponse.json(
      {
        error: "Verification failed",
        details: error?.response?.data || error?.message,
      },
      { status: 500 }
    );
  }
}
