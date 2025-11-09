"use client";

import { useState } from "react";

interface ScanDetail {
  ScanDateTime: string;
  ScanType: string;
  Scan: string;
  StatusDateTime: string;
  ScannedLocation: string;
  StatusCode: string;
  Instructions: string;
}

interface Scan {
  ScanDetail: ScanDetail;
}

interface Status {
  Status: string;
  StatusLocation: string;
  StatusDateTime: string;
  RecievedBy: string;
  StatusCode: string;
  StatusType: string;
  Instructions: string;
}

interface Consignee {
  Name: string;
  City: string;
  State: string;
  PinCode: number;
}

interface TrackingData {
  AWB: string;
  Status: Status;
  Scans: Scan[];
  ReferenceNo: string; // Order ID
  Consignee: Consignee;
}

export default function ShipmentTracker() {
  const [orderId, setOrderId] = useState("");
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async () => {
    if (!orderId.trim()) {
      setError("Please enter a valid Order ID.");
      return;
    }

    setLoading(true);
    setError(null);
    setTracking(null);

    try {
      const res = await fetch(`/api/track?order_id=${encodeURIComponent(orderId)}`);
      const data = await res.json();

      // Extract shipments from ShipmentData
      const shipmentsArray = data.ShipmentData?.map((item: any) => item.Shipment) || [];

      if (shipmentsArray.length > 0) {
        setTracking(shipmentsArray[0]);
      } else {
        setError("No tracking info found for this Order ID.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong while fetching tracking info.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shipment-tracker max-w-3xl mx-auto p-6 mt-40 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Track Your Order</h2>

      {/* Input Section */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Enter Order ID"
          className="flex-grow border px-4 py-2 rounded shadow-sm focus:ring-2 focus:ring-green-400"
        />
        <button
          onClick={handleTrack}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-orange-700 transition"
        >
          Track
        </button>
      </div>

      {loading && <p className="text-gray-600 text-center">Loading tracking info...</p>}
      {error && <p className="text-red-600 text-center">{error}</p>}

      {/* Tracking Bar */}
      {tracking && tracking.Scans.length > 0 && (
        <div className="tracking-info mt-6">
          <h3 className="text-lg font-semibold mb-2">
            Order ID: {tracking.ReferenceNo} | Waybill: {tracking.AWB}
          </h3>

          <div className="flex items-center justify-between relative mb-6">
            {/* Horizontal line */}
            <div className="absolute top-4 left-0 right-0 h-1 bg-gray-300 z-0 rounded"></div>

            {tracking.Scans.map((scan, idx) => {
              const completed = idx <= tracking.Scans.length - 1;
              return (
                <div key={idx} className="relative z-10 flex flex-col items-center text-center w-1/3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      completed ? "bg-green-600" : "bg-gray-400"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <p className="text-sm mt-2">{scan.ScanDetail.Scan}</p>
                  <p className="text-xs text-gray-500">{scan.ScanDetail.ScannedLocation}</p>
                  <p className="text-xs text-gray-400">{new Date(scan.ScanDetail.ScanDateTime).toLocaleString()}</p>
                </div>
              );
            })}
          </div>

          {/* Latest Status */}
          <div className="mt-6 border-t pt-4">
            <h4 className="font-semibold mb-2">Current Status</h4>
            <p>
              <strong>{tracking.Status.Status}</strong> at {tracking.Status.StatusLocation} (
              {new Date(tracking.Status.StatusDateTime).toLocaleString()})
            </p>
          </div>

          {/* Consignee Info */}
          <div className="mt-4 border-t pt-4">
            <h4 className="font-semibold mb-2">Consignee Info</h4>
            <p>
              {tracking.Consignee.Name}, {tracking.Consignee.City}, {tracking.Consignee.State} -{" "}
              {tracking.Consignee.PinCode}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
