// Geographic math and radius helper functions

export interface Coordinates {
  lat: number;
  lng: number;
}

// Calculate distance between two lat/lng points in kilometers using Haversine Formula
export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

// Known tech hubs & coordinates for rapid offline lookup
export const KNOWN_CITIES: Record<string, { lat: number; lng: number; label: string; country: string }> = {
  bangalore: { lat: 12.9716, lng: 77.5946, label: 'Bangalore, Karnataka, India', country: 'India' },
  kochi: { lat: 9.9312, lng: 76.2673, label: 'Kochi, Kerala, India', country: 'India' },
  mumbai: { lat: 19.0760, lng: 72.8777, label: 'Mumbai, Maharashtra, India', country: 'India' },
  delhi: { lat: 28.6139, lng: 77.2090, label: 'Delhi, India', country: 'India' },
  sf: { lat: 37.7749, lng: -122.4194, label: 'San Francisco, CA, USA', country: 'USA' },
  'san francisco': { lat: 37.7749, lng: -122.4194, label: 'San Francisco, CA, USA', country: 'USA' },
  ny: { lat: 40.7128, lng: -74.0060, label: 'New York, NY, USA', country: 'USA' },
  'new york': { lat: 40.7128, lng: -74.0060, label: 'New York, NY, USA', country: 'USA' },
  london: { lat: 51.5074, lng: -0.1278, label: 'London, United Kingdom', country: 'UK' },
  berlin: { lat: 52.5200, lng: 13.4050, label: 'Berlin, Germany', country: 'Germany' },
  germany: { lat: 51.1657, lng: 10.4515, label: 'Germany', country: 'Germany' },
  tokyo: { lat: 35.6762, lng: 139.6503, label: 'Tokyo, Japan', country: 'Japan' },
  japan: { lat: 36.2048, lng: 138.2529, label: 'Japan', country: 'Japan' },
  singapore: { lat: 1.3521, lng: 103.8198, label: 'Singapore', country: 'Singapore' },
  toronto: { lat: 43.6532, lng: -79.3832, label: 'Toronto, ON, Canada', country: 'Canada' },
  sydney: { lat: -33.8688, lng: 151.2093, label: 'Sydney, Australia', country: 'Australia' },
  australia: { lat: -25.2744, lng: 133.7751, label: 'Australia', country: 'Australia' },
  paris: { lat: 48.8566, lng: 2.3522, label: 'Paris, France', country: 'France' },
  france: { lat: 46.2276, lng: 2.2137, label: 'France', country: 'France' },
  dubai: { lat: 25.2048, lng: 55.2708, label: 'Dubai, UAE', country: 'UAE' },
};

export const DEFAULT_CENTER = KNOWN_CITIES.bangalore;

export function filterByRadius<T extends { lat: number; lng: number }>(
  items: T[],
  centerLat: number,
  centerLng: number,
  radiusKm: number
): T[] {
  return items.filter(item => getDistanceKm(centerLat, centerLng, item.lat, item.lng) <= radiusKm);
}

// Universal geocoding helper — looks up offline cache first, then calls Nominatim OSM for any global location
export async function geocodeLocation(locationName: string): Promise<{ lat: number; lng: number } | null> {
  if (!locationName || !locationName.trim()) return null;
  const locKey = locationName.toLowerCase().trim();

  // 1. Direct match
  if (KNOWN_CITIES[locKey]) {
    return { lat: KNOWN_CITIES[locKey].lat, lng: KNOWN_CITIES[locKey].lng };
  }

  // 2. Partial key match
  for (const key of Object.keys(KNOWN_CITIES)) {
    if (locKey.includes(key) || key.includes(locKey)) {
      return { lat: KNOWN_CITIES[key].lat, lng: KNOWN_CITIES[key].lng };
    }
  }

  // 3. Fallback to OpenStreetMap Nominatim for any location worldwide
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    }
  } catch (err) {
    console.warn('Nominatim geocoding error:', err);
  }

  return null;
}
