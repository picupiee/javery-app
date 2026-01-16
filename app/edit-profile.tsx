import { showAlert } from "@/lib/alert";
import { auth, db } from "@/lib/firebase";
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

export default function EditProfile() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Initialize with current user name
    const user = auth.currentUser;
    if (user) {
      setName(user.displayName || "");
    }
    setInitialLoading(false);
  }, []);

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      showAlert("Gagal", "Nama tidak boleh kosong");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      showAlert("Gagal", "Sesi berakhir. Silakan masuk kembali.");
      router.replace("/(auth)/sign-in");
      return;
    }

    setLoading(true);

    try {
      // Update Firebase Auth display name
      await user.updateProfile({ displayName: name });

      // Update user profile in Firestore
      await db.collection("users").doc(user.uid).update({
        displayName: name,
      });

      showAlert("Sukses", "Profil berhasil diperbarui.", () => {
        router.back();
      });
    } catch (error: any) {
      console.error("Update Profile error:", error.code, error.message);
      showAlert("Gagal", "Gagal memperbarui profil. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      {/* Header */}
      <View className="px-5 py-4 bg-white border-b border-slate-200 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3 w-8 h-8 items-center justify-center -ml-2"
        >
          <FontAwesome name="arrow-left" size={20} color="#64748b" />
        </TouchableOpacity>
        <Text className="font-bold text-lg text-slate-800">Ubah Profil</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="p-5">
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
                autoFocus
              />
            </View>
            <Text className="text-slate-400 text-xs mt-2 ml-1">
              Nama ini akan ditampilkan pada profil dan transaksi anda.
            </Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleUpdateProfile}
            disabled={loading || !name.trim()}
            className={`bg-primary p-4 rounded-xl items-center ${
              loading || !name.trim()
                ? "opacity-70 bg-slate-400"
                : "bg-orange-500"
            }`}
          >
            {loading ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="#ffffff" size="small" />
                <Text className="text-white font-bold text-base ml-2">
                  Menyimpan...
                </Text>
              </View>
            ) : (
              <Text className="text-white font-bold text-base">Simpan</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
