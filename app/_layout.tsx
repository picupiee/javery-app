import "@/global.css";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { FontAwesome } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { router, SplashScreen, Stack, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform, View } from "react-native";
import { AuthProvider, useAuth } from "../context/AuthContext";
import useLocationStore from "@/store/location.store";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}

function AppLayout() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();

  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    ...FontAwesome.font,
  });

  const { fetchLocation } = useLocationStore();

  useEffect(() => {
    fetchLocation();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
    if (fontError) throw fontError;
  }, [fontsLoaded, fontError]);

  const inAuthGroup = segments[0] === "(auth)";

  useEffect(() => {
    if (isLoading) return;

    // If user is authenticated and in auth screens
    if (user && inAuthGroup) {
      // Check for buyer role
      if (user.profile?.roles?.buyer) {
        router.replace("/");
      } else {
        // Redirect to create profile if buyer role is missing
        router.replace("/create-profile" as any);
      }
      return;
    }

    // Platform-specific behavior for unauthenticated users
    // Allow guest browsing, don't force redirect
    // User can browse freely, auth will be required only for protected screens
  }, [user, isLoading, inAuthGroup]);

  useEffect(() => {
    if (user?.uid) {
      import("@/utils/notificationHelper").then(
        ({ registerForPushNotificationsAsync }) => {
          registerForPushNotificationsAsync().then((token) => {
            if (token) {
              import("@/lib/firebase").then(({ db }) => {
                db.collection("users")
                  .doc(user.uid)
                  .update({ buyerPushToken: token })
                  .catch((err) =>
                    console.error("Error updating push token:", err)
                  );
              });
            }
          });
        }
      );
    }
  }, [user?.uid]);

  if (!fontsLoaded || isLoading) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="create-profile" />
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="product" />
        <Stack.Screen name="seller" />
        <Stack.Screen name="orders" />
        <Stack.Screen name="address" />
        <Stack.Screen name="checkout" />
      </Stack>
      <StatusBar style="dark" />
    </View>
  );
}
