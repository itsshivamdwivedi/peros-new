import { NextResponse } from "next/server";

interface CartItem {
  id: string;
  name?: string;
  title?: string;
  quantity: number;
  price: number;
}

interface Address {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  address: string;
  city?: string;
  state: string;
  pincode: string;
}

export async function POST(request: Request) {
  try {
    console.log("🟢 /api/create-shipment hit");

    const raw = await request.text();
    const { address, cart, orderId, paymentMethod } = JSON.parse(raw) as {
      address: Address;
      cart: CartItem[];
      orderId: string;
      paymentMethod: string;
    };

    if (!process.env.DELHIVERY_API_KEY) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const apiUrl = "https://track.delhivery.com/api/cmu/create.json";

    // Calculate total amount and quantity
    const totalAmount = cart
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
      .toFixed(2);

    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

    const firstItem = cart[0];
    const productName = firstItem.name || firstItem.title || "Product";

    const productDetails = cart
      .map((item) => `${item.name || item.title || "Item"} x ${item.quantity}`)
      .join(", ");

    // Construct shipment payload
    const payload = {
      pickup_location: {
        name: "Peros",
        add: "602, B wing, Parvati Apartment, Sai Baba Nagar katemanivli kalyan east",
        city: "Greater Thane",
        state: "Maharashtra",
        country: "India",
        phone: "7715889772",
        pin: "421306",
      },
      shipments: [
        {
          order: orderId,
          name: `${address.firstName} ${address.lastName}`.trim(),
          products_desc: productName,
          product_details: productDetails,
          sku: firstItem.id,
          hsn_code: "330499",
          total_amount: totalAmount,
          cod_amount: paymentMethod === "COD" ? totalAmount : "0.00",
          payment_mode: paymentMethod === "COD" ? "COD" : "Prepaid",
          order_date: new Date().toISOString(),
          add: address.address,
          city: address.city || "City",
          state: address.state,
          pin: address.pincode,
          phone: `+91${address.phone.replace(/\D/g, "").slice(-10)}`,
          country: "India",
          quantity: totalQuantity,
          product_type: "Non-Dangerous",
        },
      ],
    };

    const formData = new URLSearchParams();
    formData.append("format", "json");
    formData.append("data", JSON.stringify(payload));

    const delhiveryRes = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.DELHIVERY_API_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const text = await delhiveryRes.text();
    let responseData: any = {};

    try {
      responseData = JSON.parse(text);
    } catch (err) {
      console.error("❌ JSON PARSE FAILED:", err);
    }

    const failed =
      !!responseData.error ||
      (Array.isArray(responseData.packages) &&
        responseData.packages.some((p: any) => p.status !== "Success"));

    if (failed) {
      return NextResponse.json(
        { error: "Shipment creation failed", details: responseData },
        { status: 500 }
      );
    }

    // Grab wbns and waybill from first package
    const wbns = responseData.packages?.[0]?.wbns || null;
    const waybill = responseData.packages?.[0]?.waybill || null;


    console.log("🚚 Shipment created. Waybill:", waybill, "WBNS:", wbns);

    return NextResponse.json({
      success: true,
      message: "Shipment created successfully",
      waybill,
      wbns,
      details: responseData,
    });
  } catch (error: any) {
    console.error("🔥 FATAL ERROR:", error);
    return NextResponse.json(
      { error: "Fatal error", details: error.message },
      { status: 500 }
    );
  }
}
