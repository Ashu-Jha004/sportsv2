interface GeolocationResult {
  latitude: number;
  longitude: number;
  country: string;
  state: string;
  city: string;
}

interface GeocodeResult {
  country: string;
  state: string;
  city: string;
}

/**
 * Get user's current location using browser Geolocation API
 */
export async function getCurrentLocation(): Promise<{
  latitude: number;
  longitude: number;
}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    const timeoutId = setTimeout(() => {
      reject(new Error("Location request timed out"));
    }, 10000); // 10 second timeout

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        clearTimeout(timeoutId);
        let errorMessage = "Failed to get location";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }

        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Reverse geocode coordinates to get address using Nominatim (OpenStreetMap)
 * Free and no API key required
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeocodeResult> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      {
        headers: {
          "User-Agent": "Sparta Associate Application",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Geocoding failed");
    }

    const data = await response.json();

    if (!data.address) {
      throw new Error("Address not found");
    }

    const address = data.address;

    return {
      country: address.country || "",
      state: address.state || address.region || address.province || "",
      city:
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        "",
    };
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    throw new Error("Failed to get address from coordinates");
  }
}

/**
 * Get complete location information
 */
export async function getCompleteLocation(): Promise<GeolocationResult> {
  try {
    // Get coordinates
    const coords = await getCurrentLocation();

    // Get address from coordinates
    const address = await reverseGeocode(coords.latitude, coords.longitude);

    return {
      ...coords,
      ...address,
    };
  } catch (error) {
    console.error("Get complete location error:", error);
    throw error;
  }
}
