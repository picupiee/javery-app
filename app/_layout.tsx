import "@/global.css";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { useFonts } from "expo-font";
import { router, Slot, SplashScreen, useSegments } from "expo-router";
import { useEffect } from "react";
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

    console.log("RootLayout Effect:", { user: !!user, inAuthGroup, segments });

    if (user && inAuthGroup) {
      console.log("Redirecting to /");
      router.replace("/");
    } else if (!user && !inAuthGroup) {
      console.log("Redirecting to /sign-in");
      router.replace("/(auth)/sign-in");
    }
  }, [user, isLoading, inAuthGroup]);

  if (!fontsLoaded || isLoading) {
    return null; // Or a loading spinner
  }

  return <Slot />;
}
