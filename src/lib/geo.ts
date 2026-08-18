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

function getEditDistance(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}

// Known tech hubs & coordinates for rapid offline lookup
export const KNOWN_CITIES: Record<string, { lat: number; lng: number; label: string; country: string }> = {
  bangalore: { lat: 12.9716, lng: 77.5946, label: 'Bangalore, Karnataka, India', country: 'India' },
  bengaluru: { lat: 12.9716, lng: 77.5946, label: 'Bengaluru, Karnataka, India', country: 'India' },
  kochi: { lat: 9.9312, lng: 76.2673, label: 'Kochi, Kerala, India', country: 'India' },
  kakkanad: { lat: 10.0159, lng: 76.3419, label: 'Kakkanad, Kochi, Kerala, India', country: 'India' },
  infopark: { lat: 10.0104, lng: 76.3637, label: 'Infopark Kochi, Kerala, India', country: 'India' },
  mumbai: { lat: 19.0760, lng: 72.8777, label: 'Mumbai, Maharashtra, India', country: 'India' },
  delhi: { lat: 28.6139, lng: 77.2090, label: 'Delhi, India', country: 'India' },
  'delhi ncr': { lat: 28.4595, lng: 77.0266, label: 'Delhi NCR, India', country: 'India' },
  gurgaon: { lat: 28.4595, lng: 77.0266, label: 'Gurugram, Haryana, India', country: 'India' },
  gurugram: { lat: 28.4595, lng: 77.0266, label: 'Gurugram, Haryana, India', country: 'India' },
  noida: { lat: 28.5355, lng: 77.3910, label: 'Noida, Uttar Pradesh, India', country: 'India' },
  hyderabad: { lat: 17.3850, lng: 78.4867, label: 'Hyderabad, Telangana, India', country: 'India' },
  pune: { lat: 18.5204, lng: 73.8567, label: 'Pune, Maharashtra, India', country: 'India' },
  chennai: { lat: 13.0827, lng: 80.2707, label: 'Chennai, Tamil Nadu, India', country: 'India' },
  trivandrum: { lat: 8.5241, lng: 76.9366, label: 'Thiruvananthapuram, Kerala, India', country: 'India' },
  thiruvananthapuram: { lat: 8.5241, lng: 76.9366, label: 'Thiruvananthapuram, Kerala, India', country: 'India' },
  coimbatore: { lat: 11.0168, lng: 76.9558, label: 'Coimbatore, Tamil Nadu, India', country: 'India' },
  ahmedabad: { lat: 23.0225, lng: 72.5714, label: 'Ahmedabad, Gujarat, India', country: 'India' },
  kolkata: { lat: 22.5726, lng: 88.3639, label: 'Kolkata, West Bengal, India', country: 'India' },
  jaipur: { lat: 26.9124, lng: 75.7873, label: 'Jaipur, Rajasthan, India', country: 'India' },
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

export function getLocalLocationSuggestions(query: string, limit = 6) {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return [];

  return Object.entries(KNOWN_CITIES)
    .map(([key, city]) => {
      const label = city.label.toLowerCase();
      const score = key.startsWith(normalized)
        ? 0
        : label.includes(normalized)
        ? 1
        : getEditDistance(normalized, key);

      return { label: city.label, lat: city.lat, lng: city.lng, score };
    })
    .filter((item) => item.score <= Math.max(2, Math.floor(normalized.length / 3)))
    .sort((a, b) => a.score - b.score || a.label.localeCompare(b.label))
    .filter((item, index, arr) => arr.findIndex((candidate) => candidate.label === item.label) === index)
    .slice(0, limit);
}

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

  const fuzzyMatch = getLocalLocationSuggestions(locationName, 1)[0];
  if (fuzzyMatch) {
    return { lat: fuzzyMatch.lat, lng: fuzzyMatch.lng };
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
