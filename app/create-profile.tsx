import { showAlert } from "@/lib/alert";
import firebase from "@/lib/firebase";
const { auth, db } = firebase;
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateProfile() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    // Wait for auth to be ready
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setAuthReady(true);
      } else {
        // If no user, redirect to sign-in
        router.replace("/(auth)/sign-in");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCreateProfile = async () => {
    if (!name) {
      showAlert("Gagal", "Mohon isi nama lengkap anda");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      showAlert("Gagal", "Sesi berakhir. Silakan masuk kembali.");
      setTimeout(() => {
        router.replace("/(auth)/sign-in");
      }, 1500);
      return;
    }

    setLoading(true);

    try {
      console.log(
        `[CreateProfile] Creating/Updating profile for UID: ${user?.uid}`
      );
      // Update Firebase Auth display name
      await user?.updateProfile({ displayName: name });

      // Fetch existing profile to preserve roles
      const docSnap = await db.collection("users").doc(user?.uid).get();
      const existingData = docSnap.data();
      const existingRoles = existingData?.roles || {};

      await db
        .collection("users")
        .doc(user?.uid)
        .set(
          {
            uid: user?.uid,
            email: user?.email,
            displayName: name,
            roles: {
              ...existingRoles,
              buyer: true,
            },
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

      showAlert("Selamat Datang!", "Profil pembeli berhasil dibuat.", () => {
        router.replace("/");
      });
    } catch (error: any) {
      console.error("Create Profile error:", error.code, error.message);
      showAlert("Gagal", "Gagal membuat profil. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while waiting for auth
  if (!authReady) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="text-slate-600 mt-4">Memuat...</Text>
      </SafeAreaView>
    );
  }

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
              Lengkapi Profil Anda
            </Text>
            <Text className="text-slate-600 font-medium">
              Anda sudah punya akun. Isi nama untuk mulai belanja!
            </Text>
          </View>

          {/* Form */}
          <View className="mb-6">
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

          {/* Create Profile Button */}
          <TouchableOpacity
            onPress={handleCreateProfile}
            disabled={loading}
            className={`bg-primary p-4 rounded-xl items-center ${
              loading ? "opacity-70" : ""
            }`}
          >
            {loading ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="#ffffff" size="small" />
                <Text className="text-white font-bold text-base ml-2">
                  Membuat Profil...
                </Text>
              </View>
            ) : (
              <Text className="text-white font-bold text-base">
                Lengkapi Profil →
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
