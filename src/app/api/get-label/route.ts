import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const waybill = url.searchParams.get("waybill");
  const pdfSize = url.searchParams.get("pdf_size") || "A4";

  if (!waybill) {
    return NextResponse.json({ error: "No waybill provided" }, { status: 400 });
  }

  try {
    const apiUrl = `https://track.delhivery.com/api/p/packing_slip?wbns=${waybill}&pdf=true&pdf_size=${pdfSize}`;
    console.log("🔗 Calling Delhivery API:", apiUrl);

    const options = {
      method: "GET",
      headers: {
        Authorization: `Token ${process.env.DELHIVERY_API_KEY}`,
        "Content-Type": "application/json",
      },
    };

    // Call Delhivery API
    const res = await fetch(apiUrl, options);
    const data = await res.json();
    console.log("📝 Delhivery API Response:", data);

    if (!res.ok || !data.packages || data.packages.length === 0) {
      console.error("❌ Failed to get PDF URL from Delhivery:", data);
      return NextResponse.json({ error: "Failed to get PDF URL", details: data }, { status: res.status });
    }

    const pdfUrl = data.packages[0].pdf_download_link;
    if (!pdfUrl) {
      console.error("❌ PDF download link missing in Delhivery response:", data);
      return NextResponse.json({ error: "PDF download link missing", details: data }, { status: 500 });
    }

    // Fetch the actual PDF from the S3 URL
    const pdfRes = await fetch(pdfUrl);
    if (!pdfRes.ok) {
      const text = await pdfRes.text();
      console.error("❌ Failed to fetch PDF from S3 URL:", text);
      return NextResponse.json({ error: "Failed to fetch PDF from S3 URL", details: text }, { status: pdfRes.status });
    }

    const pdfBuffer = await pdfRes.arrayBuffer();
    console.log(`✅ PDF fetched successfully | Size: ${pdfBuffer.byteLength} bytes`);

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${waybill}.pdf"`,
      },
    });

  } catch (err) {
    console.error("🔥 Unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error", details: String(err) }, { status: 500 });
  }
}
// jr
