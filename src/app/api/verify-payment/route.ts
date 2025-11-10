import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

interface TokenResponse {
  access_token: string;
}

export async function GET(req: NextRequest) {
  const { CLIENT_ID, CLIENT_SECRET, CLIENT_VERSION, AUTH_URL, PG_URL } = process.env;

  console.log('🔧 ENV Variables at start:', {
    CLIENT_ID,
    CLIENT_SECRET: CLIENT_SECRET ? '***' : null, // mask secret
    CLIENT_VERSION,
    AUTH_URL,
    PG_URL,
  });

  const { searchParams } = new URL(req.url);
  const transactionId = searchParams.get('transactionId');

  if (!transactionId) {
    console.error('❌ Missing transactionId in request');
    return NextResponse.json({ error: 'Missing transactionId' }, { status: 400 });
  }

  if (!CLIENT_ID || !CLIENT_SECRET || !CLIENT_VERSION || !AUTH_URL || !PG_URL) {
    console.error('❌ Missing required environment variables');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  try {
    // Step 1: Get OAuth token
    console.log('🔄 Requesting access token from PhonePe...');
    const formData = new URLSearchParams();
    formData.append('grant_type', 'client_credentials');
    formData.append('client_id', CLIENT_ID);
    formData.append('client_secret', CLIENT_SECRET);
    formData.append('client_version', CLIENT_VERSION);

    console.log('📤 Token request payload:', formData.toString());

    const tokenRes = await axios.post<TokenResponse>(
      `${AUTH_URL}/v1/oauth/token`,
      formData,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token } = tokenRes.data;
    console.log('✅ Access Token acquired successfully:', access_token);

    // Step 2: Verify payment
    const statusUrl = `${PG_URL}/checkout/v2/order/${transactionId}/status`;
    console.log('🔄 Fetching payment status from:', statusUrl);

    const verifyRes = await axios.get(statusUrl, {
      headers: {
        Authorization: `O-Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📦 Raw verification response:', JSON.stringify(verifyRes.data, null, 2));

    const { state, amount, errorCode, detailedErrorCode, paymentDetails, metaInfo } = verifyRes.data;

    console.log('✅ Extracted details:', {
      state,
      amount,
      errorCode,
      detailedErrorCode,
      paymentDetails,
      metaInfo,
    });

    return NextResponse.json({
      transactionId,
      state,
      amount,
      errorCode,
      detailedErrorCode,
      paymentDetails,
      metaInfo,
    });

  } catch (error: any) {
    console.error('❌ Verification failed:', error?.response?.data || error?.message);
    return NextResponse.json(
      {
        error: 'Verification failed',
        details: error?.response?.data || error?.message,
      },
      { status: 500 }
    );
  }
}




