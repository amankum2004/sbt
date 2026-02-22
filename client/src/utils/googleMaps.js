const GOOGLE_MAPS_EMBED_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_EMBED_API_KEY ||
  import.meta.env.VITE_GOOGLE_GEOCODE_API_KEY;

const GOOGLE_EMBED_DIRECTIONS_ENDPOINT =
  "https://www.google.com/maps/embed/v1/directions";
const GOOGLE_WEB_DIRECTIONS_ENDPOINT = "https://www.google.com/maps/dir/";

export const toCoordinateNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (typeof value === "object") {
    if (typeof value.$numberDecimal === "string") {
      const parsed = Number(value.$numberDecimal);
      return Number.isFinite(parsed) ? parsed : null;
    }

    if (typeof value.toString === "function") {
      const parsed = Number(value.toString());
      return Number.isFinite(parsed) ? parsed : null;
    }
  }

  return null;
};

export const hasValidCoordinates = (lat, lng) =>
  toCoordinateNumber(lat) !== null && toCoordinateNumber(lng) !== null;

const formatCoordinatePair = (lat, lng) => {
  const latitude = toCoordinateNumber(lat);
  const longitude = toCoordinateNumber(lng);

  if (latitude === null || longitude === null) return null;
  return `${latitude},${longitude}`;
};

const buildAddressText = (shop = {}) =>
  [shop.street, shop.city, shop.district, shop.state, shop.pin, "India"]
    .map((part) => part?.toString().trim())
    .filter(Boolean)
    .join(", ");

export const buildGoogleEmbedDirectionsUrl = ({
  originLat,
  originLng,
  destinationLat,
  destinationLng,
  travelMode = "walking",
} = {}) => {
  const hasOrigin = hasValidCoordinates(originLat, originLng);
  const hasDestination = hasValidCoordinates(destinationLat, destinationLng);

  if (!GOOGLE_MAPS_EMBED_API_KEY || !hasOrigin || !hasDestination) return null;

  const params = new URLSearchParams({
    key: GOOGLE_MAPS_EMBED_API_KEY,
    origin: formatCoordinatePair(originLat, originLng),
    destination: formatCoordinatePair(destinationLat, destinationLng),
    mode: travelMode,
  });

  return `${GOOGLE_EMBED_DIRECTIONS_ENDPOINT}?${params.toString()}`;
};

export const buildGoogleWebDirectionsUrl = ({
  originLat,
  originLng,
  destinationLat,
  destinationLng,
  fallbackAddress = "",
  travelMode = "walking",
} = {}) => {
  const hasOrigin = hasValidCoordinates(originLat, originLng);
  const hasDestination = hasValidCoordinates(destinationLat, destinationLng);

  if (hasDestination) {
    const params = new URLSearchParams({
      api: "1",
      destination: formatCoordinatePair(destinationLat, destinationLng),
      travelmode: travelMode,
      dir_action: "navigate",
    });

    if (hasOrigin) {
      params.set("origin", formatCoordinatePair(originLat, originLng));
    }

    return `${GOOGLE_WEB_DIRECTIONS_ENDPOINT}?${params.toString()}`;
  }

  if (fallbackAddress) {
    const params = new URLSearchParams({
      api: "1",
      destination: fallbackAddress,
      travelmode: travelMode,
      dir_action: "navigate",
    });

    if (hasOrigin) {
      params.set("origin", formatCoordinatePair(originLat, originLng));
    }

    return `${GOOGLE_WEB_DIRECTIONS_ENDPOINT}?${params.toString()}`;
  }

  return "#";
};

export const buildDirectionsLinksFromShop = ({ shop, userLocation }) => {
  if (!shop) {
    return { embedUrl: null, webUrl: "#", hasDestinationCoordinates: false };
  }

  const hasDestinationCoordinates = hasValidCoordinates(shop.lat, shop.lng);
  const embedUrl = buildGoogleEmbedDirectionsUrl({
    originLat: userLocation?.lat,
    originLng: userLocation?.lng,
    destinationLat: shop.lat,
    destinationLng: shop.lng,
  });

  const webUrl = buildGoogleWebDirectionsUrl({
    originLat: userLocation?.lat,
    originLng: userLocation?.lng,
    destinationLat: shop.lat,
    destinationLng: shop.lng,
    fallbackAddress: buildAddressText(shop),
  });

  return { embedUrl, webUrl, hasDestinationCoordinates };
};

export const buildDirectionsUrlFromShop = ({ shop, userLocation }) => {
  const { webUrl } = buildDirectionsLinksFromShop({ shop, userLocation });
  return webUrl;
};
