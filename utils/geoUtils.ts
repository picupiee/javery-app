import { getDistance } from "geolib";

export const calculateDistance = (
  userLocation: { latitude: number; longitude: number } | null | undefined,
  storeLocation: { latitude: number; longitude: number } | null | undefined
) => {
  if (!userLocation || !storeLocation) return null;
  const distanceInMeters = getDistance(
    { latitude: userLocation.latitude, longitude: userLocation.longitude },
    { latitude: storeLocation.latitude, longitude: storeLocation.longitude }
  );

  const km = distanceInMeters / 1000;
  return km < 1 ? `${(km * 1000).toFixed(0)} m` : `${km.toFixed(1)} km`;
};
