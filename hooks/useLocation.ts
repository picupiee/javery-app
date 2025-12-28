import * as Location from "expo-location";
import { useState, useEffect } from "react";

export const useUserLocation = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Permission to access location was denied");
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      } catch (err) {
        console.error("Error fetching location:", err);
        setError("Failed to fetch location");
      } finally {
        setLoading(false);
      }
    };
    fetchLocation();
  }, []);

  return { location, loading, error };
};
