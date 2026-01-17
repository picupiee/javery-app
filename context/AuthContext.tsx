import firebase from "@/lib/firebase";
const { auth, db } = firebase;
import { AugmentedUser, UserProfile } from "@/types/index";
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
  onError: (error: any) => void,
) => {
  return db
    .collection("users")
    .doc(uid)
    .onSnapshot(
      (docSnap) => {
        const profileData = docSnap.data();
        console.log(
          `[AuthContext] Snapshot for ${uid} has data: ${
            profileData ? "Yes" : "No"
          }`,
        );
        if (profileData) {
          onProfile(profileData as UserProfile);
        } else {
          console.log("User profile not found");
          onProfile(null);
        }
      },
      (error) => {
        console.error("Error listening to user profile:", error);
        onError(error);
      },
    );
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
    if (user?.uid) {
      try {
        await db.collection("users").doc(user.uid).update({
          buyerPushToken: null,
        });
        console.log("Buyer push token removed successfully");
      } catch (error) {
        console.error("Error removing buyer push token:", error);
      }
    }
    await auth.signOut();
  };

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = auth.onAuthStateChanged((firebaseUser) => {
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
          console.log(
            `[AuthContext] Profile for ${firebaseUser.uid}: ${
              profileData ? "Found" : "Not Found"
            }`,
          );
          if (profileData) {
            const augmentedUser: AugmentedUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              emailVerified: firebaseUser.emailVerified,
              isAnonymous: firebaseUser.isAnonymous,
              photoURL: firebaseUser.photoURL,
              profile: profileData,
            } as any; // Cast because AugmentedUser extends User and we can't easily mock all methods
            setUser(augmentedUser);
          } else {
            console.warn(
              "Logged in user has no profile data. Waiting for creation...",
            );
            const augmentedUser: AugmentedUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              emailVerified: firebaseUser.emailVerified,
              isAnonymous: firebaseUser.isAnonymous,
              photoURL: firebaseUser.photoURL,
              profile: null as any,
            } as any;
            setUser(augmentedUser);
          }
          setIsLoading(false);
        },
        (error) => {
          console.error("Error during profile subscription:", error);
          setIsLoading(false);
        },
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
