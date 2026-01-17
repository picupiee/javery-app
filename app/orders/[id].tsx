import { db } from "@/lib/firebase";
import { getOrderById } from "@/services/orderService";
import { Order } from "@/types";
import { FontAwesome } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [sellerPhone, setSellerPhone] = useState<string | null>(null);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      if (!id) return;
      setLoading(true);
      const data = await getOrderById(id);
      setOrder(data);
      if (data) {
        fetchSellerPhone(data.sellerUid);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSellerPhone = async (uid: string) => {
    // Fetch seller profile to get phone number for WhatsApp
    try {
      const userDoc = await db.collection("users").doc(uid).get();
      const data = userDoc.data();
      if (data) {
        if (data?.profile?.phoneNumber) {
          setSellerPhone(data.profile.phoneNumber);
        }
      }
    } catch (e) {
      console.error("Error fetching seller phone:", e);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/account");
    }
  };

  const handleChatSeller = () => {
    if (!sellerPhone) return;
    // Format: 628...
    const url = `https://wa.me/${sellerPhone}`;
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!order) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text>Pesanan tidak ditemukan</Text>
        <TouchableOpacity onPress={handleBack} className="mt-4">
          <Text className="text-primary font-bold">Kembali</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const statusLabels: any = {
    waiting: "Menunggu Konfirmasi",
    processing: "Sedang Diproses",
    delivering: "Dalam Pengiriman",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <View className="p-4 bg-white border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={handleBack} className="mr-4">
          <FontAwesome name="arrow-left" size={20} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Detail Pesanan</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Status Card */}
        <View className="bg-white p-4 rounded-xl border border-gray-100 mb-4">
          <Text className="text-slate-500 text-xs font-bold mb-1">
            STATUS PESANAN
          </Text>
          <Text className="text-xl font-bold text-primary mb-2">
            {statusLabels[order.status]}
          </Text>
          <Text className="text-slate-400 text-xs">ID: {order.id}</Text>
        </View>

        {/* Store & Actions */}
        <View className="bg-white p-4 rounded-xl border border-gray-100 mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <FontAwesome name="shopping-bag" size={18} color="#f97316" />
              <Text className="font-bold text-lg ml-2">{order.sellerName}</Text>
            </View>
            {sellerPhone && (
              <TouchableOpacity
                onPress={handleChatSeller}
                className="bg-green-100 px-3 py-1.5 rounded-full flex-row items-center"
              >
                <FontAwesome name="whatsapp" size={16} color="#16a34a" />
                <Text className="text-green-700 font-bold ml-1 text-xs">
                  Chat Penjual
                </Text>
              </TouchableOpacity>
            )}
            
          </View>

          {/* Items */}
          {order.items.map((item, idx) => (
            <View
              key={idx}
              className="flex-row mb-3 border-b border-gray-50 pb-3 last:border-0 last:pb-0 last:mb-0"
            >
              <ImageWithSkeleton
                source={{
                  uri: item.productImage || "https://via.placeholder.com/60",
                }}
                style={{ width: 48, height: 48, marginRight: 12 }}
                borderRadius={4}
              />
              <View className="flex-1">
                <Text className="font-medium text-slate-700">
                  {item.productName}
                </Text>
                <Text className="text-slate-500 text-xs">
                  {item.quantity} x Rp{" "}
                  {item.productPrice.toLocaleString("id-ID")}
                </Text>
              </View>
              <Text className="font-medium">
                Rp {(item.quantity * item.productPrice).toLocaleString("id-ID")}
              </Text>
            </View>
          ))}
        </View>

        {/* Shipping Info */}
        <View className="bg-white p-4 rounded-xl border border-gray-100 mb-4">
          <Text className="text-slate-500 text-xs font-bold mb-2">
            INFO PENGIRIMAN
          </Text>
          <View>
            <Text className="font-bold text-slate-700">
              {order.shippingAddress.name} •{" "}
              {order.shippingAddress.recipientName}
            </Text>
            <Text className="text-slate-600 text-sm mt-1">
              {order.shippingAddress.phoneNumber}
            </Text>
            <Text className="text-slate-500 text-sm mt-1 leading-5">
              {order.shippingAddress.fullAddress}
            </Text>
          </View>
        </View>

        {/* Payment Summary */}
        <View className="bg-white p-4 rounded-xl border border-gray-100 mb-8">
          <Text className="text-slate-500 text-xs font-bold mb-3">
            RINCIAN PEMBAYARAN
          </Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-slate-600">Metode Pembayaran</Text>
            <Text className="font-medium">COD (Bayar Ditempat)</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-slate-600">
              Total Harga ({order.items.length} Barang)
            </Text>
            <Text className="font-medium">
              Rp {order.totalAmount.toLocaleString("id-ID")}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-slate-600">Ongkos Kirim</Text>
            <Text className="font-medium text-green-600">Gratis</Text>
          </View>
          <View className="border-t border-dashed border-gray-200 mt-2 pt-3 flex-row justify-between items-center">
            <Text className="font-bold text-lg text-slate-800">
              Total Belanja
            </Text>
            <Text className="font-bold text-xl text-primary">
              Rp {order.totalAmount.toLocaleString("id-ID")}
            </Text>
          </View>
        </View>
      </ScrollView>

      {order.status === "delivering" && (
        <View className="bg-indigo-50 p-4 m-4 rounded-xl border border-indigo-100 flex-row items-center">
          <FontAwesome name="truck" size={24} color="#4f46e5" />
          <View className="ml-3 flex-1">
            <Text className="text-indigo-800 font-bold">
              Pesanan Sedang Diantar!
            </Text>
            <Text className="text-indigo-600 text-xs mt-1">
              Pesanan akan otomatis selesai dalam 30 menit setelah pengantaran
              dimulai.
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
