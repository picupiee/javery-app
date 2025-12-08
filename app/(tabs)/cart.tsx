import GuestPrompt from "@/components/GuestPrompt";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/services/cartService";
import { CartItem } from "@/types";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CartScreen() {
  const { user } = useAuth();
  const { cartItems, loading, updateQuantity, removeFromCart } = useCart();

  // Group items by Seller
  const groupedItems = useMemo(() => {
    const groups: { [key: string]: { sellerName: string; items: CartItem[] } } =
      {};
    cartItems.forEach((item) => {
      if (!groups[item.sellerUid]) {
        groups[item.sellerUid] = {
          sellerName: item.sellerName,
          items: [],
        };
      }
      groups[item.sellerUid].items.push(item);
    });
    return groups;
  }, [cartItems]);

  const handleCheckout = (sellerUid: string) => {
    // Pass the sellerUid to checkout to know which group to process
    router.push(`/checkout?sellerUid=${sellerUid}`);
  };

  if (!user) {
    return <GuestPrompt screen="Cart" />;
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
        <Image
          source={{
            uri: "https://img.freepik.com/free-vector/shopping-cart-realistic_1284-6011.jpg",
          }} // Placeholder or use an icon
          className="w-48 h-48 mb-6"
          resizeMode="contain"
        />
        <View className="w-24 h-24 bg-orange-50 rounded-full items-center justify-center mb-6">
          <FontAwesome name="shopping-basket" size={40} color="#f97316" />
        </View>
        <Text className="text-xl font-bold text-slate-800 mb-2">
          Keranjang Kosong
        </Text>
        <Text className="text-slate-500 text-center mb-8">
          Belum ada produk yang ditambahkan. Yuk mulai belanja sayur segar!
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/search")}
          className="bg-primary px-8 py-3 rounded-full"
        >
          <Text className="text-white font-bold">Mulai Belanja</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <View className="p-4 bg-white border-b border-gray-100">
        <Text className="text-2xl font-bold text-slate-800">Keranjang</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {Object.entries(groupedItems).map(([sellerUid, group]) => (
          <View
            key={sellerUid}
            className="bg-white rounded-xl p-4 mb-4 border border-gray-100 shadow-sm"
          >
            <View className="flex-row items-center mb-4 border-b border-gray-50 pb-2">
              <FontAwesome name="shopping-bag" size={16} color="#f97316" />
              <Text className="font-bold text-lg ml-2 text-slate-700">
                {group.sellerName}
              </Text>
            </View>

            {group.items.map((item) => (
              <View key={item.id} className="flex-row mb-4">
                <Image
                  source={{
                    uri: item.productImage || "https://via.placeholder.com/100",
                  }}
                  className="w-16 h-16 rounded-lg bg-gray-100"
                />
                <View className="flex-1 ml-3 justify-between">
                  <View>
                    <Text
                      className="font-medium text-slate-800"
                      numberOfLines={1}
                    >
                      {item.productName}
                    </Text>
                    <Text className="text-primary font-bold">
                      Rp {item.productPrice.toLocaleString("id-ID")}
                    </Text>
                  </View>

                  <View className="flex-row items-center justify-between mt-2">
                    <View className="flex-row items-center bg-gray-50 rounded-lg">
                      <TouchableOpacity
                        onPress={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="p-1 px-3"
                      >
                        <Text className="text-slate-600 font-bold">-</Text>
                      </TouchableOpacity>
                      <Text className="mx-2 font-medium">{item.quantity}</Text>
                      <TouchableOpacity
                        onPress={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-1 px-3"
                      >
                        <Text className="text-slate-600 font-bold">+</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                      <FontAwesome name="trash-o" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

            <View className="flex-row justify-between items-center mt-2 pt-3 border-t border-dashed border-gray-200">
              <View>
                <Text className="text-xs text-slate-500">Total Pesanan</Text>
                <Text className="font-bold text-lg text-primary">
                  Rp{" "}
                  {group.items
                    .reduce(
                      (sum, item) => sum + item.productPrice * item.quantity,
                      0
                    )
                    .toLocaleString("id-ID")}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleCheckout(sellerUid)}
                className="bg-primary px-6 py-2.5 rounded-lg"
              >
                <Text className="text-white font-bold">Checkout</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {/* Padding for bottom nav */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
