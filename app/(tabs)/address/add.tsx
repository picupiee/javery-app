import { useAuth } from "@/context/AuthContext";
import { addAddress } from "@/services/addressService";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddAddressScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "", // Label e.g. Home
    recipientName: "",
    phoneNumber: "",
    fullAddress: "",
    notes: "",
    isDefault: false,
  });

  const handleSave = async () => {
    if (!user) return;
    if (
      !form.name ||
      !form.recipientName ||
      !form.phoneNumber ||
      !form.fullAddress
    ) {
      Alert.alert("Error", "Mohon lengkapi semua data wajib.");
      return;
    }

    setLoading(true);
    try {
      await addAddress(user.uid, form);
      router.back();
    } catch (error) {
      Alert.alert("Error", "Gagal menyimpan alamat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-4 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <FontAwesome name="arrow-left" size={20} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Tambah Alamat</Text>
      </View>

      <ScrollView className="flex-1 p-6">
        <View className="mb-4">
          <Text className="text-slate-600 font-medium mb-2">Label Alamat</Text>
          <TextInput
            placeholder="Contoh: Rumah, Kantor"
            className="p-4 bg-gray-50 rounded-xl border border-gray-200"
            value={form.name}
            onChangeText={(t) => setForm({ ...form, name: t })}
          />
        </View>

        <View className="mb-4">
          <Text className="text-slate-600 font-medium mb-2">Nama Penerima</Text>
          <TextInput
            placeholder="Nama lengkap penerima"
            className="p-4 bg-gray-50 rounded-xl border border-gray-200"
            value={form.recipientName}
            onChangeText={(t) => setForm({ ...form, recipientName: t })}
          />
        </View>

        <View className="mb-4">
          <Text className="text-slate-600 font-medium mb-2">Nomor Telepon</Text>
          <TextInput
            placeholder="08xxxxxxxx"
            keyboardType="phone-pad"
            className="p-4 bg-gray-50 rounded-xl border border-gray-200"
            value={form.phoneNumber}
            onChangeText={(t) => setForm({ ...form, phoneNumber: t })}
          />
        </View>

        <View className="mb-4">
          <Text className="text-slate-600 font-medium mb-2">
            Alamat Lengkap
          </Text>
          <TextInput
            placeholder="Jalan, Nomor, RT/RW, Kelurahan, Kecamatan"
            multiline
            numberOfLines={3}
            className="p-4 bg-gray-50 rounded-xl border border-gray-200 min-h-[100px]"
            style={{ textAlignVertical: "top" }}
            value={form.fullAddress}
            onChangeText={(t) => setForm({ ...form, fullAddress: t })}
          />
        </View>

        <View className="mb-4">
          <Text className="text-slate-600 font-medium mb-2">
            Catatan (Opsional)
          </Text>
          <TextInput
            placeholder="Patokan, warna pagar, dll"
            className="p-4 bg-gray-50 rounded-xl border border-gray-200"
            value={form.notes}
            onChangeText={(t) => setForm({ ...form, notes: t })}
          />
        </View>

        <View className="flex-row justify-between items-center mb-8 bg-gray-50 p-4 rounded-xl">
          <Text className="font-medium text-slate-700">
            Jadikan Alamat Utama
          </Text>
          <Switch
            value={form.isDefault}
            onValueChange={(v) => setForm({ ...form, isDefault: v })}
            trackColor={{ true: "#f97316" }}
          />
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className={`p-4 rounded-xl items-center mb-10 ${
            loading ? "bg-gray-300" : "bg-primary"
          }`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Simpan Alamat</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
