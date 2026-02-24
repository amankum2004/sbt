// Ola Krutrim (Ola Maps) helper utilities for directions and distance
const OLA_WEB_MAPS_BASE = "https://maps.olakrutrim.com";
const OLA_API_SERVER = "https://api.olamaps.io";

const OLA_API_KEY = import.meta.env.VITE_OLA_API_KEY || null;

// Helper: validate coordinate is a finite number
const isValidCoordinate = (value) => {
  const num = Number(value);
  return Number.isFinite(num);
};

export const buildOlaWebDirectionsUrl = ({ originLat, originLng, destinationLat, destinationLng, travelMode = "driving" } = {}) => {
  if (!isValidCoordinate(originLat) || !isValidCoordinate(originLng) || !isValidCoordinate(destinationLat) || !isValidCoordinate(destinationLng)) {
    return null; // Return null to signal fallback to Google Maps
  }
  const origin = `${originLat},${originLng}`;
  const destination = `${destinationLat},${destinationLng}`;

  // Public web directions UI (opens Ola Maps web directions)
  return `${OLA_WEB_MAPS_BASE}/directions?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${encodeURIComponent(travelMode)}`;
};

export const buildOlaEmbedDirectionsUrl = ({ originLat, originLng, destinationLat, destinationLng, travelMode = "driving" } = {}) => {
  // Ola Maps does not allow embedding their web UI in an iframe (CSP frame-ancestors: 'none').
  // Therefore we intentionally do NOT return an embeddable URL. Return null so callers
  // fall back to opening the web URL in a new tab instead of attempting to iframe it.
  if (!originLat || !originLng || !destinationLat || !destinationLng) return null;
  return null;
};

export const fetchOlaDirections = async ({ originLat, originLng, destinationLat, destinationLng, mode = "driving", steps = true, alternatives = false, overview = "full" } = {}) => {
  const origin = `${originLat},${originLng}`;
  const destination = `${destinationLat},${destinationLng}`;
  const params = new URLSearchParams({ origin, destination, mode, steps: String(steps), alternatives: String(alternatives), overview });
  if (OLA_API_KEY) params.set("api_key", OLA_API_KEY);

  const url = `${OLA_API_SERVER}/routing/v1/directions?${params.toString()}`;
  const res = await fetch(url, { method: "POST" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ola directions request failed: ${res.status} ${text}`);
  }
  return res.json();
};

export const fetchOlaDistanceMatrix = async ({ origins, destinations, mode = "driving" } = {}) => {
  const params = new URLSearchParams({ origins: origins.join('|'), destinations: destinations.join('|'), mode });
  if (OLA_API_KEY) params.set('api_key', OLA_API_KEY);
  const url = `${OLA_API_SERVER}/routing/v1/distanceMatrix?${params.toString()}`;
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ola distanceMatrix failed: ${res.status} ${text}`);
  }
  return res.json();
};

export default {
  buildOlaWebDirectionsUrl,
  buildOlaEmbedDirectionsUrl,
  fetchOlaDirections,
  fetchOlaDistanceMatrix,
};
