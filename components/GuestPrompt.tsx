import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { Platform, Text, TouchableOpacity, View } from "react-native";

interface GuestPromptProps {
  screen: string;
}

export default function GuestPrompt({ screen }: GuestPromptProps) {
  return (
    <View className="flex-1 bg-slate-50 items-center justify-center px-6">
      <View className="bg-white p-8 rounded-3xl border border-slate-200 max-w-md w-full">
        {/* Icon */}
        <View className="w-20 h-20 bg-orange-100 rounded-full items-center justify-center mx-auto mb-6">
          <FontAwesome name="lock" size={32} color="#f97316" />
        </View>

        {/* Title */}
        <Text className="text-2xl font-bold text-slate-800 text-center mb-3">
          Sign In Required
        </Text>

        {/* Description */}
        <Text className="text-slate-600 text-center mb-8 font-medium">
          To access your {screen.toLowerCase()}, please sign in or create an
          account.
        </Text>

        {/* Benefits */}
        <View className="mb-8 space-y-3">
          <View className="flex-row items-center">
            <View className="w-6 h-6 bg-green-100 rounded-full items-center justify-center mr-3">
              <FontAwesome name="check" size={12} color="#22c55e" />
            </View>
            <Text className="text-slate-700 font-medium flex-1">
              Save your favorite items
            </Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-6 h-6 bg-green-100 rounded-full items-center justify-center mr-3">
              <FontAwesome name="check" size={12} color="#22c55e" />
            </View>
            <Text className="text-slate-700 font-medium flex-1">
              Track your orders
            </Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-6 h-6 bg-green-100 rounded-full items-center justify-center mr-3">
              <FontAwesome name="check" size={12} color="#22c55e" />
            </View>
            <Text className="text-slate-700 font-medium flex-1">
              Get personalized recommendations
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <TouchableOpacity
          onPress={() => router.push("/(auth)/sign-in")}
          className="bg-primary p-4 rounded-xl mb-3"
        >
          <Text className="text-white font-bold text-center text-base">
            Sign In
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/sign-up")}
          className="bg-slate-100 p-4 rounded-xl"
        >
          <Text className="text-slate-800 font-bold text-center text-base">
            Create Account
          </Text>
        </TouchableOpacity>

        {/* Back to browsing */}
        {Platform.OS === "web" && (
          <TouchableOpacity onPress={() => router.back()} className="mt-4">
            <Text className="text-slate-500 font-medium text-center text-sm">
              Continue Browsing
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
