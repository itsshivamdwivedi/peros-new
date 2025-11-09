import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { address, cart, orderId } = await request.json();


    if (!process.env.DELHIVERY_API_KEY) {
      return NextResponse.json(
        { error: "Delhivery API key not configured" },
        { status: 500 }
      );
    }

   
    const apiUrl = new URL("https://track.delhivery.com/api/cmu/create.json");
    apiUrl.searchParams.set("format", "json");

   
    const payload = {
      format: "json", 
      data: JSON.stringify({
        pickup_location: {
          name: "Peros",
          add: "602, B wing, Parvati Apartment, Sai Baba Nagar katemanivli kalyan east",
          city: "Greater Thane",
          state: "Maharashtra",
          country: "India",
          phone: "7715889772",
          pin: "421306"
        },
        shipments: [
          {
            // waybill: orderId,
            order: orderId,
            products_desc: cart.map((item: any) => item.name).join(", "),
            order_date: new Date().toISOString(),
            total_amount: cart.reduce(
              (sum: number, item: any) => sum + item.price * item.quantity,
              0
            ).toFixed(2),
            cod_amount: cart.reduce(
              (sum: number, item: any) => sum + item.price * item.quantity,
              0
            ).toFixed(2), 
            name: `${address.firstName} ${address.lastName}`.trim(),
            add: address.address,
            city: address.city,
            state: address.state,
            pin: address.pincode,
            phone: `+91${address.phone.replace(/\D/g, "").slice(-10)}`,
            payment_mode: "COD",
            country: "India",
            quantity: cart.reduce((sum:any, item:any) => sum + item.quantity, 0),
            product_type: "Non-Dangerous"
          }
        ]
        
      })
    };


    const formData = new URLSearchParams();
    formData.append("format", "json");
    formData.append("data", payload.data);

   
    console.log("Final API URL:", apiUrl.toString());
    console.log("Request Payload:", formData.toString());

    const delhiveryRes = await fetch(apiUrl.toString(), {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.DELHIVERY_API_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString()
    });

    const responseData = await delhiveryRes.json();
    
    if (!delhiveryRes.ok || responseData.error) {
      console.error("Delhivery API Failure:", {
        status: delhiveryRes.status,
        response: responseData
      });
      return NextResponse.json(
        { error: "Shipment creation failed", details: responseData },
        { status: 500 }
      );
    }

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error("Critical Server Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}