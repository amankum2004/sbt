// utils/mapMyIndia.js
import { mapMyIndiaConfig } from './locationData';

// Get MapMyIndia directions URL (opens in new tab)
export const getMapMyIndiaDirectionsUrl = (shop, userLocation = null) => {
  if (!shop.lat || !shop.lng) return "#";
  
  const destination = `${shop.lat},${shop.lng}`;
  let url = `https://maps.mapmyindia.com/directions?`;
  
  if (userLocation) {
    // If user location is available, set both origin and destination
    url += `origin=${userLocation.lat},${userLocation.lng}`;
  } else {
    // If no user location, let MapMyIndia detect current location
    url += `origin=current`;
  }
  
  url += `&destination=${destination}`;
  url += `&region=ind`;
  url += `&zoom=15`;
  
  return url;
};

// Get MapMyIndia static map image URL (for thumbnails)
export const getMapMyIndiaStaticMapUrl = (shop, width = 400, height = 200) => {
  if (!shop.lat || !shop.lng) return null;
  
  return `https://apis.mapmyindia.com/advancedmaps/v1/${mapMyIndiaConfig.apiKey}/static_map?` +
    `markers=${shop.lat},${shop.lng}|${shop.shopname}&` +
    `zoom=15&` +
    `size=${width}x${height}`;
};

// Get MapMyIndia place page URL
export const getMapMyIndiaPlaceUrl = (shop) => {
  if (!shop.lat || !shop.lng) return "#";
  
  return `https://maps.mapmyindia.com/?` +
    `q=${shop.lat},${shop.lng}&` +
    `zoom=15`;
};

// Alternative: Use OpenStreetMap as fallback for embedded maps
export const getOpenStreetMapEmbedUrl = (shop) => {
  if (!shop.lat || !shop.lng) return "#";
  
  return `https://www.openstreetmap.org/export/embed.html?` +
    `bbox=${shop.lng - 0.01},${shop.lat - 0.01},${shop.lng + 0.01},${shop.lat + 0.01}&` +
    `marker=${shop.lat},${shop.lng}&` +
    `layer=mapnik`;
};

// Get OpenStreetMap view URL
export const getOpenStreetMapViewUrl = (shop) => {
  if (!shop.lat || !shop.lng) return "#";
  
  return `https://www.openstreetmap.org/?` +
    `mlat=${shop.lat}&mlon=${shop.lng}&` +
    `zoom=15&` +
    `layers=M`;
};

// Geocode address using MapMyIndia API
export const geocodeAddress = async (address) => {
  try {
    const response = await fetch(
      `${mapMyIndiaConfig.geocodeUrl}?address=${encodeURIComponent(address)}&region=IND`,
      {
        headers: {
          'Authorization': `Bearer ${mapMyIndiaConfig.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Geocoding failed');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

// Get route information
export const getRouteInfo = async (origin, destination) => {
  try {
    const originStr = `${origin.lng},${origin.lat}`;
    const destinationStr = `${destination.lng},${destination.lat}`;
    
    const response = await fetch(
      `${mapMyIndiaConfig.directionsUrl}/${mapMyIndiaConfig.apiKey}/route_adv/driving/${originStr};${destinationStr}?geometries=polyline&overview=full`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Route calculation failed');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Route calculation error:', error);
    return null;
  }
};






// // utils/mapMyIndia.js
// import { mapMyIndiaConfig } from './locationData';

// // Get directions URL for MapMyIndia
// export const getMapMyIndiaDirectionsUrl = (shop, userLocation = null) => {
//   if (!shop.lat || !shop.lng) return "#";
  
//   const destination = `${shop.lat},${shop.lng}`;
//   let url = `https://maps.mapmyindia.com/directions?`;  
  
//   if (userLocation) {
//     // If user location is available, set both origin and destination
//     url += `origin=${userLocation.lat},${userLocation.lng}`;
//   } else {
//     // If no user location, let MapMyIndia detect current location
//     url += `origin=current`;
//   }
  
//   url += `&destination=${destination}`;
//   url += `&region=ind`;
//   url += `&zoom=15`;
  
//   return url;
// };

// // Alternative: Get directions via MapMyIndia API (for embedded maps)
// export const getMapMyIndiaEmbedUrl = (shop, userLocation = null) => {
//   if (!shop.lat || !shop.lng) return "#";
  
//   const destination = `${shop.lat},${shop.lng}`;
//   let url = `https://maps.mapmyindia.com/embed?`;
  
//   if (userLocation) {
//     url += `center=${userLocation.lat},${userLocation.lng}`;
//   } else {
//     url += `center=${shop.lat},${shop.lng}`;
//   }
  
//   url += `&zoom=15`;
//   url += `&markers=${shop.lat},${shop.lng}`;
  
//   return url;
// };

// // Geocode address using MapMyIndia API
// export const geocodeAddress = async (address) => {
//   try {
//     const response = await fetch(
//       `${mapMyIndiaConfig.geocodeUrl}?address=${encodeURIComponent(address)}&region=IND`,
//       {
//         headers: {
//           'Authorization': `Bearer ${mapMyIndiaConfig.apiKey}`
//         }
//       }
//     );
    
//     if (!response.ok) {
//       throw new Error('Geocoding failed');
//     }
    
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Geocoding error:', error);
//     return null;
//   }
// };

// // Get route information
// export const getRouteInfo = async (origin, destination) => {
//   try {
//     const originStr = `${origin.lng},${origin.lat}`;
//     const destinationStr = `${destination.lng},${destination.lat}`;
    
//     const response = await fetch(
//       `${mapMyIndiaConfig.directionsUrl}/${mapMyIndiaConfig.apiKey}/route_adv/driving/${originStr};${destinationStr}?geometries=polyline&overview=full`,
//       {
//         headers: {
//           'Accept': 'application/json'
//         }
//       }
//     );
    
//     if (!response.ok) {
//       throw new Error('Route calculation failed');
//     }
    
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Route calculation error:', error);
//     return null;
//   }
// };