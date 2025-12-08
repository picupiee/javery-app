import { useAuth } from "@/context/AuthContext";
import { getMyOrders } from "@/services/orderService";
import { Order } from "@/types";
import { FontAwesome } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const StatusBadge = ({ status }: { status: Order["status"] }) => {
  const colors: any = {
    waiting: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    delivering: "bg-indigo-100 text-indigo-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const labels: any = {
    waiting: "Menunggu Konfirmasi",
    processing: "Diproses",
    delivering: "Dalam Pengiriman",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };

  const style = colors[status] || "bg-gray-100 text-gray-800";
  const bgClass = style.split(" ")[0];
  const textClass = style.split(" ")[1];

  return (
    <View className={`${bgClass} px-3 py-1 rounded-full self-start`}>
      <Text className={`${textClass} text-xs font-bold`}>
        {labels[status] || status}
      </Text>
    </View>
  );
};

export default function OrderListScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getMyOrders(user.uid);
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const renderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      onPress={() => router.push(`/orders/${item.id}`)}
      className="bg-white p-4 rounded-xl border border-gray-100 mb-4 shadow-sm"
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-row items-center">
          <FontAwesome name="shopping-bag" size={14} color="#f97316" />
          <Text className="font-bold text-slate-700 ml-2">
            {item.sellerName}
          </Text>
        </View>
        <Text className="text-xs text-slate-400">
          {new Date(
            item.createdAt?.seconds * 1000 || Date.now()
          ).toLocaleDateString("id-ID")}
        </Text>
      </View>

      <View className="flex-row justify-between mb-3">
        <View>
          <Text className="text-slate-600 font-medium mb-1">
            {item.items?.[0]?.productName || "Pesanan"}{" "}
            {item.items?.length > 1 ? `+${item.items.length - 1} lainnya` : ""}
          </Text>
          <Text className="text-slate-400 text-xs">Total Belanja</Text>
        </View>
        <View className="items-end">
          <Text className="font-bold text-primary text-base">
            Rp {item.totalAmount.toLocaleString("id-ID")}
          </Text>
        </View>
      </View>

      <View className="border-t border-gray-50 pt-3">
        <StatusBadge status={item.status} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <View className="p-4 bg-white border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <FontAwesome name="arrow-left" size={20} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Riwayat Pesanan</Text>
      </View>

      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <FontAwesome name="shopping-bag" size={48} color="#e2e8f0" />
              <Text className="text-slate-400 mt-4 text-center">
                Belum ada pesanan.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
