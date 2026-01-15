import { showAlert, showConfirm } from "@/lib/alert";
import GuestPrompt from "@/components/GuestPrompt";
import { useAuth } from "@/context/AuthContext";
import useUpdates from "@/hooks/useUpdate";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SettingsItem = ({
  icon,
  title,
  onPress,
  subtitle,
}: {
  icon: any;
  title: string;
  onPress: () => void;
  subtitle?: string;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center justify-between p-4 border-b border-gray-50 active:bg-gray-50"
  >
    <View className="flex-row items-center">
      <View className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-3">
        <FontAwesome name={icon} size={20} color="#f97316" />
      </View>
      <View>
        <Text className="text-slate-800 font-medium text-base">{title}</Text>
        {subtitle && (
          <Text className="text-slate-400 text-xs mt-0.5">{subtitle}</Text>
        )}
      </View>
    </View>
    <FontAwesome name="angle-right" size={16} color="#cbd5e1" />
  </TouchableOpacity>
);

export default function Account() {
  const { user, logout } = useAuth();

  // Show guest prompt if not authenticated
  if (!user) {
    return <GuestPrompt screen="Account" />;
  }

  const userName =
    user?.profile?.displayName || user?.email?.split("@")[0] || "Pengguna";
  const email = user.email || "Email tidak ditemukan";
  const [loading, setLoading] = useState(false);
  const { updateStatus, error, activeCheckAndApplyUpdate } = useUpdates();

  const isChecking =
    updateStatus === "checking" || updateStatus === "downloading";

  const handleCheckUpdate = async () => {
    await activeCheckAndApplyUpdate();
    if (updateStatus !== "checking") {
      showAlert("Versi Terbaru", "Aplikasi sudah versi terbaru.");
    }
  };

  const handleLogout = async () => {
    showConfirm(
      "Keluar dari Javery",
      "Apakah anda yakin ingin keluar?",
      async () => {
        setLoading(true);
        try {
          await logout();
          router.replace("/");
        } catch (error) {
          console.error("Logout error: ", error);
          showAlert(
            "Gagal",
            "Terjadi kesalahan. Silakan tutup paksa aplikasi!"
          );
        } finally {
          setLoading(false);
        }
      },
      undefined,
      "Keluar"
    );
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
        <View className="bg-white m-5 p-5 rounded-2xl border border-slate-200 shadow-sm">
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
            <TouchableOpacity
              onPress={() => router.push("/edit-profile")}
              className="p-2 -mr-2"
            >
              <FontAwesome name="pencil" size={20} color="#94a3b8" />
            </TouchableOpacity>
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
        <View className="mx-5 mb-5">
          <Text className="text-base font-bold text-slate-700 mb-2 ml-1">
            Pengaturan
          </Text>
          <View className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <SettingsItem
              icon="map-marker"
              title="Alamat Saya"
              subtitle="Kelola alamat pengiriman"
              onPress={() => router.push("/address")}
            />

            <SettingsItem
              icon="history"
              title="Riwayat Pesanan"
              subtitle="Lihat status dan histori belanja"
              onPress={() => router.push("/orders")}
            />

            <SettingsItem
              icon={isChecking ? "spinner" : "cloud-download"}
              title={
                isChecking
                  ? "Memeriksa..."
                  : updateStatus === "ready"
                    ? "Pembaruan Siap!"
                    : "Periksa Pembaruan"
              }
              onPress={handleCheckUpdate}
            />
          </View>

          {updateStatus === "error" && (
            <Text className="text-red-500 text-xs text-center mt-2">
              {error}
            </Text>
          )}

          <Text className="text-slate-400 text-xs text-center mt-4">
            Versi Aplikasi 1.2.5
          </Text>
        </View>

        {/* Logout Button */}
        <View className="mx-5 mb-20">
          <TouchableOpacity
            onPress={handleLogout}
            disabled={loading}
            className="p-4 bg-white border border-red-100 rounded-2xl active:bg-red-50 flex-row justify-center items-center shadow-sm"
          >
            {loading ? (
              <ActivityIndicator color="#dc2626" size="small" />
            ) : (
              <Text className="text-red-600 text-center font-bold text-base">
                Keluar Aplikasi
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
