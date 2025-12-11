import { auth, db } from "@/lib/firebase";
import { AugmentedUser, UserProfile } from "@/types/index";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: AugmentedUser | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const subscribeToUserProfile = (
  uid: string,
  onProfile: (profile: UserProfile | null) => void,
  onError: (error: any) => void
) => {
  const docRef = doc(db, "users", uid);

  const unsubscribe = onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onProfile(docSnap.data() as UserProfile);
      } else {
        console.log("User profile not found in Firestore for UID: ", uid);
        onProfile(null);
      }
    },
    (error) => {
      console.error("Error listening to user profile:", error);
      onError(error);
    }
  );

  return unsubscribe;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AugmentedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = async () => {
    await auth!.signOut();
  };

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth!, (firebaseUser) => {
      console.log("Got User :", firebaseUser?.uid);
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (!firebaseUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      unsubscribeProfile = subscribeToUserProfile(
        firebaseUser.uid,
        (profileData) => {
          if (profileData) {
            const augmentedUser: AugmentedUser = {
              ...firebaseUser,
              profile: profileData,
            };
            setUser(augmentedUser);
          } else {
            console.warn(
              "Logged in user has no profile data. Waiting for creation..."
            );
            // Allow user to stay logged in so they can create profile
            const augmentedUser: AugmentedUser = {
              ...firebaseUser,
              profile: null as any,
            };
            setUser(augmentedUser);
          }
          setIsLoading(false);
        },
        (error) => {
          console.error("Error during profile subscription:", error);
          setIsLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  const value = {
    user,
    isLoading,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}
