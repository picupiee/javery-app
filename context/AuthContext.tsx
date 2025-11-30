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
    await auth.signOut();
  };

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
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
            // If no profile exists yet (e.g. just signed up), we might still want to allow them in
            // or handle it differently. For now, let's assume profile creation happens at signup.
            // If we want to be strict:
            // auth.signOut();

            // But let's be lenient for now and just set the user without profile if needed,
            // OR better, wait for profile creation.
            // Let's stick to the pattern: if logged in, should have profile.
            console.warn(
              "Logged in user has no profile data. Waiting for creation..."
            );
            // Do NOT sign out here. The profile might be in the process of being created (Sign Up flow).
            // The onSnapshot listener will fire again when the document is created.
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
