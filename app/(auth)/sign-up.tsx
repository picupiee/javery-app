import { showAlert, showConfirm } from "@/lib/alert";
import useUpdates from "@/hooks/useUpdate";
import { auth, db } from "@/lib/firebase";
import { UserProfile } from "@/types";
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

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      showAlert("Gagal", "Mohon isi semua kolom");
      return;
    }

    setLoading(true);
    try {
      // 1. Create Auth User
      const userCredential = await auth.createUserWithEmailAndPassword(
        email,
        password
      );
      const user = userCredential.user;

      // 2. Update Display Name
      await user.updateProfile({ displayName: name });

      // 3. Create Firestore Profile with buyer role
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: name,
        createdAt: new Date().toISOString(),
        roles: {
          buyer: true,
          seller: false,
        },
      };

      await db.collection("users").doc(user.uid).set(userProfile);
      await user.sendEmailVerification();
      showAlert("Verifikasi Email Anda", `Halo, ${name}! Silahkan cek kotak masuk email anda untuk memverifikasi email anda.`);
      // Router replace is handled in _layout.tsx
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        showConfirm(
          "Akun Sudah Ada",
          "Email ini sudah terdaftar. Silakan masuk.",
          () => router.push("/(auth)/sign-in"),
          undefined,
          "Masuk"
        );
      } else {
        showAlert("Gagal", error.message);
      }
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
                Buat Akun
              </Text>
              <Text className="text-slate-600 font-medium">
                Daftar untuk mulai belanja produk segar
              </Text>
            </View>

            {/* Form */}
            <View className="space-y-4 mb-6">
              {/* Name */}
              <View>
                <Text className="text-slate-700 mb-2 font-semibold text-sm">
                  Nama Lengkap
                </Text>
                <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 py-3">
                  <FontAwesome name="user" size={18} color="#94a3b8" />
                  <TextInput
                    className="flex-1 ml-3 font-medium text-slate-800"
                    placeholder="Nama lengkap anda"
                    placeholderTextColor="#94a3b8"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>

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
                    placeholder="Buat kata sandi"
                    placeholderTextColor="#94a3b8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              onPress={handleSignUp}
              disabled={loading}
              className={`bg-primary p-4 rounded-xl items-center mb-3 ${loading ? "opacity-70" : ""
                }`}
            >
              {loading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="#ffffff" size="small" />
                  <Text className="text-white font-bold text-base ml-2">
                    Mendaftar...
                  </Text>
                </View>
              ) : (
                <Text className="text-white font-bold text-base">
                  Buat Akun →
                </Text>
              )}
            </TouchableOpacity>

            {/* Sign In Link */}
            <View className="flex-row justify-center mt-4">
              <Text className="text-slate-600 font-medium">
                Sudah punya akun?{" "}
              </Text>
              <Link href="/(auth)/sign-in" asChild>
                <TouchableOpacity>
                  <Text className="text-primary font-bold">Masuk</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
