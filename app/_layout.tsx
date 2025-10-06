import "@/global.css";
import useAuthStore from "@/store/auth.store";
import {
  Quicksand_300Light,
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
  useFonts,
} from "@expo-google-fonts/quicksand";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isLoading, fetchAuthenticatedUser } = useAuthStore();

  const [fontsLoaded, error] = useFonts({
    "Quicksand-Regular": Quicksand_400Regular,
    "Quicksand-Bold": Quicksand_700Bold,
    "Quicksand-SemiBold": Quicksand_600SemiBold,
    "Quicksand-Light": Quicksand_300Light,
    "Quicksand-Medium": Quicksand_500Medium,
  });
  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);
  useEffect(() => {
    fetchAuthenticatedUser();
  }, []);

  if (!fontsLoaded || isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" className="scale-150" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, statusBarStyle: "inverted" }} />
  );
}
