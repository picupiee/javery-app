import GuestPrompt from "@/components/GuestPrompt";
import { useAuth } from "@/context/AuthContext";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Cart() {
  const { user } = useAuth();

  // Show guest prompt if not authenticated
  if (!user) {
    return <GuestPrompt screen="Cart" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <Text className="text-xl font-bold">Cart Screen</Text>
      <Text className="text-gray-500 font-medium">Coming in Stage 3</Text>
    </SafeAreaView>
  );
}
