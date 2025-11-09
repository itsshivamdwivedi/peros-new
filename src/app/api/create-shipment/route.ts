import { NextResponse } from "next/server";

interface CartItem {
  id: string;
  name?: string;      // some of your cart items use `title`
  title?: string;     // so we support both
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
    console.log("📩 RAW BODY:", raw);

    const { address, cart, orderId, paymentMethod } = JSON.parse(raw) as {
      address: Address;
      cart: CartItem[];
      orderId: string;
      paymentMethod: string;
    };

    console.log("✅ Parsed address/cart/order:", { address, cart, orderId });

    if (!process.env.DELHIVERY_API_KEY) {
      console.error("❌ Missing DELHIVERY_API_KEY");
      return NextResponse.json(
        { error: "API Key missing" },
        { status: 500 }
      );
    }

    const apiUrl = new URL("https://track.delhivery.com/api/cmu/create.json");
    apiUrl.searchParams.set("format", "json");

    const totalAmount = cart
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
      .toFixed(2);

    // ✅ Your products sometimes use "title" instead of "name"
    const firstItem = cart[0];
    const productName = firstItem.name || firstItem.title || "Product";

    const productDetails = cart
      .map((item) => {
        const name = item.name || item.title || "Item";
        return `${name} x ${item.quantity}`;
      })
      .join(", ");

    const totalQuantity = cart.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    // ✅ Delhivery requires these fields for correct label
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

    // ✅ Ship To name (customer)
    name: `${address.firstName} ${address.lastName}`.trim(),

    // ✅ Product displayed on label
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
]

    };

    console.log("📦 FINAL PAYLOAD:", JSON.stringify(payload, null, 2));

    const formData = new URLSearchParams();
    formData.append("format", "json");
    formData.append("data", JSON.stringify(payload));

    console.log("📤 FORMDATA SENT:", formData.toString());

    const delhiveryRes = await fetch(apiUrl.toString(), {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.DELHIVERY_API_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    console.log("📥 DELHIVERY STATUS:", delhiveryRes.status);

    const text = await delhiveryRes.text();
    console.log("📥 RAW RESPONSE TEXT:", text);

    let responseData: any = {};

    try {
      responseData = JSON.parse(text);
    } catch (err) {
      console.error("❌ JSON PARSE FAILED:", err);
    }

    console.log("🚚 PARSED RESPONSE:", responseData);

    // ✅ Safer TS-friendly failure detection
    const failed =
      !!responseData.error ||
      (Array.isArray(responseData.packages) &&
        responseData.packages.some((p: any) => p.status !== "Success"));

    if (failed) {
      console.error("❌ Shipment failure:", responseData);
      return NextResponse.json(
        { error: "Shipment creation failed", details: responseData },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Shipment created successfully",
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
