import "@/global.css";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { FontAwesome } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { router, Slot, SplashScreen, useSegments } from "expo-router";
import { useEffect } from "react";
import { Platform, View } from "react-native";
import { AuthProvider, useAuth } from "../context/AuthContext";

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
    if (!user && !inAuthGroup) {
      if (Platform.OS === "web") {
        // Web: Allow guest browsing, don't force redirect
        // User can browse freely, auth will be required only for protected screens
      } else {
        // Native: Require authentication
        router.replace("/(auth)/sign-in");
      }
    }
  }, [user, isLoading, inAuthGroup]);

  if (!fontsLoaded || isLoading) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <Slot />
    </View>
  );
}
