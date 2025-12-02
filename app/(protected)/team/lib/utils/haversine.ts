// lib/utils/haversine.ts
/**
 * Calculate distance between two lat/lon points using Haversine formula
 * @returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export interface Coordinates {
  lat: any;
  lng: any;
}

export function haversineDistance(
  coords1: Coordinates,
  coords2: Coordinates,
  unit: "km" | "miles" = "km"
): number {
  const R = unit === "km" ? 6371 : 3958.8; // Earth's radius
  const dLat = ((coords2.lat - coords1.lat) * Math.PI) / 180;
  const dLng = ((coords2.lng - coords1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coords1.lat * Math.PI) / 180) *
      Math.cos((coords2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function filterNearbyAthletes(
  athletes: any,
  teamLat: number,
  teamLng: number,
  maxDistanceKm = 100
): any {
  return athletes
    .map((athlete: any) => {
      if (!athlete.latitude || !athlete.longitude) return null;
      const distance = haversineDistance(
        { lat: teamLat, lng: teamLng },
        { lat: athlete.latitude, lng: athlete.longitude }
      );
      return { ...athlete, distanceKm: distance } as any;
    })
    .filter(
      (athlete: any): athlete is any =>
        athlete !== null && athlete.distanceKm! <= maxDistanceKm
    )
    .sort((a: any, b: any) => a.distanceKm! - b.distanceKm!);
}
