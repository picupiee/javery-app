import { create } from "zustand";
import * as Location from "expo-location";

type LocationState = {
  location: Location.LocationObject | null;
  loading: boolean;
  error: string | null;
  fetchLocation: () => Promise<void>;
};

const useLocationStore = create<LocationState>((set) => ({
  location: null,
  loading: true,
  error: null,
  fetchLocation: async () => {
    set({ loading: true, error: null });
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        set({
          error: "Permission to access location was denied",
          loading: false,
        });
        return;
      }

      // Try to get last known position first (fast)
      const lastKnown = await Location.getLastKnownPositionAsync({});
      if (lastKnown) {
        set({ location: lastKnown, loading: false });
      }

      // Then fetch current position (more accurate but slower)
      // We use Balanced accuracy for speed
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      set({ location, loading: false });
    } catch (err) {
      console.error("Error fetching location:", err);
      set({ error: "Failed to fetch location", loading: false });
    }
  },
}));

export default useLocationStore;
