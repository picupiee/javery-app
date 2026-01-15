import { showAlert } from "@/lib/alert";
import useUpdates from "@/hooks/useUpdate";
import { auth } from "@/lib/firebase";
import { FontAwesome } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
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

  const handleSignIn = async () => {
    if (!email || !password) {
      showAlert("Gagal", "Mohon isi semua kolom");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password)
      const user = userCredential.user
      if (!user.emailVerified) {
        setLoading(false)
        showAlert("Email Belum Terverifikasi", "Silahkan klik OK untuk memverifikasi email anda", (() => user.sendEmailVerification().then(() => showAlert("Verifikasi Telah Dikirim", "Silahkan cek kotak masuk email anda"))));
        return;
      } else {
        setLoading(false)
        router.replace("/(tabs)")
      }
      // await signInWithEmailAndPassword(auth, email, password);
      // Navigation is handled by _layout.tsx based on role
    } catch (error: any) {
      showAlert("Gagal Masuk", "Email atau kata sandi salah");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 justify-center px-6 py-8">
            {/* Header */}
            <View className="items-center mb-10">
              <View className="w-20 h-20 bg-orange-100 rounded-full items-center justify-center mb-4">
                <Text className="text-4xl">🍊</Text>
              </View>
              <Text className="text-3xl font-bold text-primary mb-2">
                Javery
              </Text>
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
              className={`bg-primary p-4 rounded-xl items-center mb-3 ${loading ? "opacity-70" : ""
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
