import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { Platform, Text, TouchableOpacity, View } from "react-native";

interface GuestPromptProps {
  screen: string;
}

export default function GuestPrompt({ screen }: GuestPromptProps) {
  const getScreenName = (s: string) => {
    switch (s.toLowerCase()) {
      case "cart":
        return "keranjang";
      case "account":
        return "akun";
      default:
        return s.toLowerCase();
    }
  };

  return (
    <View className="flex-1 bg-slate-50 items-center justify-center px-6">
      <View className="bg-white p-8 rounded-3xl border border-slate-200 max-w-md w-full">
        {/* Icon */}
        <View className="w-20 h-20 bg-orange-100 rounded-full items-center justify-center mx-auto mb-6">
          <FontAwesome name="lock" size={32} color="#f97316" />
        </View>

        {/* Title */}
        <Text className="text-2xl font-bold text-slate-800 text-center mb-3">
          Masuk Diperlukan
        </Text>

        {/* Description */}
        <Text className="text-slate-600 text-center mb-8 font-medium">
          Untuk mengakses {getScreenName(screen)} anda, silakan masuk atau buat
          akun.
        </Text>

        {/* Benefits */}
        <View className="mb-8 space-y-3">
          <View className="flex-row items-center">
            <View className="w-6 h-6 bg-green-100 rounded-full items-center justify-center mr-3">
              <FontAwesome name="check" size={12} color="#22c55e" />
            </View>
            <Text className="text-slate-700 font-medium flex-1">
              Simpan item favorit anda
            </Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-6 h-6 bg-green-100 rounded-full items-center justify-center mr-3">
              <FontAwesome name="check" size={12} color="#22c55e" />
            </View>
            <Text className="text-slate-700 font-medium flex-1">
              Lacak pesanan anda
            </Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-6 h-6 bg-green-100 rounded-full items-center justify-center mr-3">
              <FontAwesome name="check" size={12} color="#22c55e" />
            </View>
            <Text className="text-slate-700 font-medium flex-1">
              Dapatkan rekomendasi personal
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <TouchableOpacity
          onPress={() => router.push("/(auth)/sign-in")}
          className="bg-primary p-4 rounded-xl mb-3"
        >
          <Text className="text-white font-bold text-center text-base">
            Masuk
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/sign-up")}
          className="bg-slate-100 p-4 rounded-xl"
        >
          <Text className="text-slate-800 font-bold text-center text-base">
            Buat Akun
          </Text>
        </TouchableOpacity>

        {/* Back to browsing */}
      </View>
    </View>
  );
}
