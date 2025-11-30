import { auth } from "@/lib/firebase";
import { Link } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Router replace is handled in _layout.tsx
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white justify-center px-6">
      <View className="items-center mb-10">
        <Text className="text-3xl font-bold text-primary mb-2 font-quicksand-bold">
          Javery
        </Text>
        <Text className="text-gray-500 font-quicksand-medium">
          Sign in to continue shopping
        </Text>
      </View>

      <View className="space-y-4">
        <View>
          <Text className="text-gray-700 mb-2 font-quicksand-medium">
            Email
          </Text>
          <TextInput
            className="w-full bg-gray-100 p-4 rounded-xl font-quicksand-medium"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View>
          <Text className="text-gray-700 mb-2 font-quicksand-medium">
            Password
          </Text>
          <TextInput
            className="w-full bg-gray-100 p-4 rounded-xl font-quicksand-medium"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          onPress={handleSignIn}
          disabled={loading}
          className={`w-full bg-black p-4 rounded-xl items-center ${
            loading ? "opacity-70" : ""
          }`}
        >
          <Text className="text-white font-bold text-lg font-quicksand-bold">
            {loading ? "Signing In..." : "Sign In"}
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-4">
          <Text className="text-gray-500 font-quicksand-medium">
            Don't have an account?{" "}
          </Text>
          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity>
              <Text className="text-primary font-bold font-quicksand-bold">
                Sign Up
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
