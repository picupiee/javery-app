import "@/global.css";
import {
  Quicksand_300Light,
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from "@expo-google-fonts/quicksand";
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
    Quicksand_300Light,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
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
