import useUpdates from "@/hooks/useUpdate";
import { auth } from "@/lib/firebase";
import { FontAwesome } from "@expo/vector-icons";
import { Link } from "expo-router";
import {
    browserLocalPersistence,
    setPersistence,
    signInWithEmailAndPassword,
} from "firebase/auth";
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
      Alert.alert("Gagal", "Mohon isi semua kolom");
      return;
    }

    setLoading(true);
    try {
      if (Platform.OS === "web") {
        await setPersistence(auth, browserLocalPersistence);
      }
      await signInWithEmailAndPassword(auth, email, password);
      // Navigation is handled by _layout.tsx based on role
    } catch (error: any) {
      Alert.alert("Gagal Masuk", "Email atau kata sandi salah");
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
              Japri Ahlinya !
            </Text>
          </View>

          {/* Welcome Text */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-slate-800 mb-2">
              Selamat Datang!
            </Text>
            <Text className="text-slate-600 font-medium">
              Masuk untuk mulai berbelanja
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4 mb-6">
            {/* Email */}
            <View>
              <Text className="text-slate-700 mb-2 font-semibold text-sm">
                Alamat Email
              </Text>
              <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 py-3">
                <FontAwesome name="envelope" size={18} color="#94a3b8" />
                <TextInput
                  className="flex-1 ml-3 font-medium text-slate-800"
                  placeholder="nama@email.com"
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
                Kata Sandi
              </Text>
              <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 py-3">
                <FontAwesome name="lock" size={18} color="#94a3b8" />
                <TextInput
                  className="flex-1 ml-3 font-medium text-slate-800"
                  placeholder="Masukkan kata sandi"
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
                  Masuk...
                </Text>
              </View>
            ) : (
              <Text className="text-white font-bold text-base">Masuk →</Text>
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
                    Memeriksa...
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center">
                  <FontAwesome name="download" size={16} color="#1e293b" />
                  <Text className="text-slate-800 font-semibold ml-2">
                    Instal Aplikasi
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
                Lanjut sebagai Tamu
              </Text>
            </TouchableOpacity>
          )}

          {/* Sign Up Link */}
          <View className="flex-row justify-center mt-4">
            <Text className="text-slate-600 font-medium">
              Belum punya akun?{" "}
            </Text>
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity>
                <Text className="text-primary font-bold">Daftar</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
