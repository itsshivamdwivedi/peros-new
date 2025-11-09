import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("order_id"); // changed from waybill
  const waybill = url.searchParams.get("waybill") || ""; // optional

  if (!orderId) {
    return NextResponse.json({ error: "No order ID provided" }, { status: 400 });
  }

  try {
    const apiUrl = `https://track.delhivery.com/api/v1/packages/json/?waybill=${waybill}&ref_ids=${orderId}`;

    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Token ${process.env.DELHIVERY_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("❌ Delhivery Error:", text);
      return NextResponse.json({ error: "Failed to fetch tracking info", details: text }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("🔥 Unexpected Error:", err);
    return NextResponse.json({ error: "Unexpected error", details: String(err) }, { status: 500 });
  }
}
