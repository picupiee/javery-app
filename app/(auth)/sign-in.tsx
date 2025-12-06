import useUpdates from "@/hooks/useUpdate";
import { auth } from "@/lib/firebase";
import { FontAwesome } from "@expo/vector-icons";
import { Link } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { updateStatus, activeCheckAndApplyUpdate } = useUpdates();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  React.useEffect(() => {
    if (Platform.OS === "web") {
      window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
      });
    }
  }, []);

  const isChecking =
    updateStatus === "checking" || updateStatus === "downloading";

  const handleInstallApp = async () => {
    if (Platform.OS === "web") {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          setDeferredPrompt(null);
        }
      } else {
        Alert.alert(
          "Install App",
          "To install the app, tap the browser menu (three dots) then select 'Install App' or 'Add to Home Screen'."
        );
      }
      return;
    }

    await activeCheckAndApplyUpdate();
  };

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
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center px-6 py-8">
          {/* Header */}
          <View className="items-center mb-10">
            <View className="w-20 h-20 bg-orange-100 rounded-full items-center justify-center mb-4">
              <Text className="text-4xl">🍊</Text>
            </View>
            <Text className="text-3xl font-bold text-primary mb-2">Javery</Text>
            <Text className="text-slate-500 font-medium text-center">
              Fresh from the farm
            </Text>
          </View>

          {/* Welcome Text */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-slate-800 mb-2">
              Welcome Back!
            </Text>
            <Text className="text-slate-600 font-medium">
              Sign in to continue shopping
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4 mb-6">
            {/* Email */}
            <View>
              <Text className="text-slate-700 mb-2 font-semibold text-sm">
                Email Address
              </Text>
              <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 py-3">
                <FontAwesome name="envelope" size={18} color="#94a3b8" />
                <TextInput
                  className="flex-1 ml-3 font-medium text-slate-800"
                  placeholder="your@email.com"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Password */}
            <View>
              <Text className="text-slate-700 mb-2 font-semibold text-sm">
                Password
              </Text>
              <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 py-3">
                <FontAwesome name="lock" size={18} color="#94a3b8" />
                <TextInput
                  className="flex-1 ml-3 font-medium text-slate-800"
                  placeholder="Enter your password"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            onPress={handleSignIn}
            disabled={loading}
            className={`bg-primary p-4 rounded-xl items-center mb-3 ${
              loading ? "opacity-70" : ""
            }`}
          >
            {loading ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="#ffffff" size="small" />
                <Text className="text-white font-bold text-base ml-2">
                  Signing In...
                </Text>
              </View>
            ) : (
              <Text className="text-white font-bold text-base">Sign In →</Text>
            )}
          </TouchableOpacity>

          {/* Install App Button (Web) */}
          {Platform.OS === "web" && (
            <TouchableOpacity
              onPress={handleInstallApp}
              disabled={isChecking}
              className="bg-slate-100 border border-slate-200 p-4 rounded-xl items-center mb-3"
            >
              {isChecking ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="#1e293b" size="small" />
                  <Text className="text-slate-800 font-semibold ml-2">
                    Checking...
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center">
                  <FontAwesome name="download" size={16} color="#1e293b" />
                  <Text className="text-slate-800 font-semibold ml-2">
                    Install App
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* Continue as Guest (Web) */}
          {Platform.OS === "web" && (
            <TouchableOpacity
              onPress={() => {
                // Just close the auth screen, user can browse
                if (window.history.length > 1) {
                  window.history.back();
                }
              }}
              className="p-4"
            >
              <Text className="text-slate-500 font-medium text-center">
                Continue as Guest
              </Text>
            </TouchableOpacity>
          )}

          {/* Sign Up Link */}
          <View className="flex-row justify-center mt-4">
            <Text className="text-slate-600 font-medium">
              Don't have an account?{" "}
            </Text>
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity>
                <Text className="text-primary font-bold">Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
