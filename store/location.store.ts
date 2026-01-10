import { create } from 'zustand';
import * as Location from 'expo-location';

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
        if (status !== 'granted') {
          set({ error: 'Permission to access location was denied', loading: false });
          return;
        }
        
        // Use last known position first for speed, then update? 
        // Or just wait. The user requested "set location in the very first time".
        // getCurrentPositionAsync can be slow.
        
        const location = await Location.getCurrentPositionAsync({});
        set({ location, loading: false });
      } catch (err) {
        console.error("Error fetching location:", err);
        set({ error: 'Failed to fetch location', loading: false });
      }
  }
}));

export default useLocationStore;
