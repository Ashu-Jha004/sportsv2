// app/api/reverse-geocode/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    // Using OpenStreetMap Nominatim (free, no API key required)
    // For production, consider using Google Maps, Mapbox, or other paid services
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      {
        headers: {
          "User-Agent": "SportsPerformanceApp/1.0", // Required by Nominatim
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch location data");
    }

    const data = await response.json();

    // Extract address components
    const address = data.address || {};

    const country = address.country || address.country_name || "";

    const state = address.state || address.region || address.province || "";

    const city =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.county ||
      "";

    return NextResponse.json({
      success: true,
      location: {
        country,
        state,
        city,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        fullAddress: data.display_name || "",
      },
    });
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get location information. Please enter manually.",
      },
      { status: 500 }
    );
  }
}
