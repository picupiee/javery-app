import { auth } from "@/lib/firebase";
import { User } from "@/type";
import { create } from "zustand";

type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;

  setIsAuthenticated: (value: boolean) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;

  fetchAuthenticatedUser: () => void;
  logout: () => Promise<void>;
};

const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,

  setIsAuthenticated: (value) => set({ isAuthenticated: value }),
  setUser: (user) => set({ user }),
  setLoading: (value) => set({ isLoading: value }),
  fetchAuthenticatedUser: () => {
    // This will be set up once when the app loads
    // The actual listener is set up below, outside the store
  },
  logout: async () => {
    set({ isLoading: true });
    try {
      await auth.signOut();
    } catch (e) {
      console.log("Logout process error: ", e);
    } finally {
      set({ isLoading: false, isAuthenticated: false, user: null });
    }
  },
}));

// Set up Firebase auth state listener once
auth.onAuthStateChanged((firebaseUser) => {
  if (firebaseUser) {
    // Convert Firebase user to app User type
    const user: User = {
      accountId: firebaseUser.uid,
      name: firebaseUser.displayName || "",
      email: firebaseUser.email || "",
      avatar: firebaseUser.photoURL || "",
    };
    useAuthStore.setState({
      isAuthenticated: true,
      user: user,
      isLoading: false,
    });
  } else {
    useAuthStore.setState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
  }
});

export default useAuthStore;
