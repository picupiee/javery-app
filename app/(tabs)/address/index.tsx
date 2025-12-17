import { useAuth } from "@/context/AuthContext";
import { deleteAddress, getAddresses } from "@/services/addressService";
import { Address } from "@/types";
import { FontAwesome } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddressListScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const fromCheckout = params.source === "checkout";
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAddresses = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getAddresses(user.uid);
      setAddresses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAddresses();
    }, [user])
  );

  const handleDelete = (id: string) => {
    if (window.confirm("Anda yakin ingin menghapus alamat ini?")) {
      if (!user) return;
      deleteAddress(user.uid, id);
      loadAddresses();
    }
  };

  const handleSelect = (address: Address) => {
    if (fromCheckout) {
      router.push({
        pathname: "/checkout",
        params: { selectedAddressId: address.id, sellerUid: params.sellerUid },
      } as any);
    }
  };

  const renderItem = ({ item }: { item: Address }) => (
    <TouchableOpacity
      onPress={() => (fromCheckout ? handleSelect(item) : null)}
      activeOpacity={fromCheckout ? 0.7 : 1}
      className={`bg-white p-4 rounded-xl border mb-3 shadow-sm ${fromCheckout ? "border-primary" : "border-gray-100"
        }`}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-row items-center">
          <Text className="font-bold text-lg text-slate-800 mr-2">
            {item.name}
          </Text>
          {item.isDefault && (
            <View className="bg-primary-100 px-2 py-0.5 rounded">
              <Text className="text-primary-700 text-xs font-medium">
                Utama
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          className="p-2 -mr-2"
        >
          <FontAwesome name="trash" size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <Text className="font-medium text-slate-700 mb-1">
        {item.recipientName} ({item.phoneNumber})
      </Text>
      <Text className="text-slate-500 text-sm leading-5">
        {item.fullAddress}
      </Text>
      {!!item.notes && (
        <Text className="text-slate-400 text-xs mt-2 italic">
          Catatan: {item.notes}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-4 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <FontAwesome name="arrow-left" size={20} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Alamat Saya</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : (
        <FlatList
          data={addresses}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <FontAwesome name="map-marker" size={48} color="#e2e8f0" />
              <Text className="text-slate-400 mt-4 text-center">
                Belum ada alamat tersimpan.
              </Text>
            </View>
          }
        />
      )}

      <View className="p-4 border-t border-gray-100">
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/address/add",
              params: { source: fromCheckout ? "checkout" : undefined },
            })
          }
          className="bg-primary p-4 rounded-xl items-center"
        >
          <Text className="text-white font-bold text-lg">
            Tambah Alamat Baru
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
