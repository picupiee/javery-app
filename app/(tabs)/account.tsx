import GuestPrompt from "@/components/GuestPrompt";
import { useAuth } from "@/context/AuthContext";
import useUpdates from "@/hooks/useUpdate";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Account() {
  const { user, logout } = useAuth();

  // Show guest prompt if not authenticated
  if (!user) {
    return <GuestPrompt screen="Account" />;
  }

  const userName =
    user?.profile?.displayName || user?.email?.split("@")[0] || "User";
  const email = user?.email || "Email not found";
  const [loading, setLoading] = useState(false);
  const { updateStatus, error, activeCheckAndApplyUpdate } = useUpdates();
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

  const handleCheckUpdate = async () => {
    if (Platform.OS === "web") {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          setDeferredPrompt(null);
        }
      } else {
        Alert.alert(
          "Instal Aplikasi",
          "Untuk menginstal aplikasi, ketuk menu browser (tiga titik) lalu pilih 'Instal Aplikasi' atau 'Tambahkan ke Layar Utama'."
        );
      }
      return;
    }

    await activeCheckAndApplyUpdate();
    if (updateStatus === "idle") {
      Alert.alert("Versi Terbaru", "Aplikasi sudah versi terbaru.");
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === "web") {
      const confirm = window.confirm(
        "Apakah anda yakin ingin keluar dari Javery?"
      );
      if (confirm) {
        logout();
      }
      return;
    }

    Alert.alert("Keluar dari Javery", "Apakah anda yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Keluar",
        onPress: async () => {
          setLoading(true);
          try {
            await logout();
            router.replace("/");
          } catch (error) {
            console.error("Logout error: ", error);
            Alert.alert(
              "Gagal",
              "Terjadi kesalahan. Silakan tutup paksa aplikasi!"
            );
          } finally {
            setLoading(false);
          }
        },
        style: "destructive",
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      {/* Header */}
      <View className="px-5 py-4 bg-white border-b border-slate-200">
        <Text className="font-bold text-2xl text-primary">Akun Saya</Text>
        <Text className="text-slate-500 text-xs mt-0.5">
          Kelola profil dan pengaturan aplikasi
        </Text>
      </View>

      <ScrollView className="flex-1">
        {/* Profile Card */}
        <View className="bg-white m-5 p-5 rounded-2xl border border-slate-200">
          <View className="flex-row items-center mb-4">
            <View className="w-16 h-16 bg-orange-100 rounded-full items-center justify-center mr-4">
              <Text className="text-2xl font-bold text-primary">
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-slate-800">
                {userName}
              </Text>
              <Text className="text-slate-600 text-sm">{email}</Text>
            </View>
          </View>

          <View className="border-t border-slate-200 pt-4">
            <Text className="text-slate-500 text-xs font-medium mb-1">
              Status Akun
            </Text>
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
              <Text className="text-slate-800 text-sm font-medium">Aktif</Text>
            </View>
          </View>
        </View>

        {/* App Settings */}
        <View className="bg-white mx-5 mb-5 p-5 rounded-2xl border border-slate-200">
          <Text className="text-lg font-bold text-slate-800 mb-4">
            Pengaturan Aplikasi
          </Text>

          <TouchableOpacity
            onPress={handleCheckUpdate}
            disabled={isChecking}
            className={`p-4 rounded-xl mb-2 ${
              updateStatus === "ready"
                ? "bg-green-600"
                : "bg-primary active:bg-primary-600"
            }`}
          >
            {isChecking ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator color="#ffffff" size="small" />
                <Text className="text-white font-semibold ml-2">
                  Memeriksa & Mengunduh...
                </Text>
              </View>
            ) : (
              <Text className="text-white text-center font-semibold">
                {updateStatus === "ready"
                  ? "Pembaruan Siap (Ketuk!)"
                  : Platform.OS === "web"
                    ? "Instal Aplikasi"
                    : "Periksa Pembaruan"}
              </Text>
            )}
          </TouchableOpacity>

          {updateStatus === "error" && (
            <Text className="text-red-500 text-xs text-center mb-2">
              {error || "Gagal memeriksa. Coba lagi nanti."}
            </Text>
          )}

          <Text className="text-slate-400 text-xs text-center mt-2">
            Versi Aplikasi 1.1.5
          </Text>
        </View>

        {/* Logout Button */}
        <View className="mx-5 mb-20">
          <TouchableOpacity
            onPress={handleLogout}
            disabled={loading}
            className="p-4 bg-red-50 border border-red-100 rounded-xl active:bg-red-100"
          >
            {loading ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator color="#dc2626" size="small" />
                <Text className="text-red-600 font-bold ml-2">Keluar...</Text>
              </View>
            ) : (
              <Text className="text-red-600 text-center font-bold text-base">
                Keluar
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
