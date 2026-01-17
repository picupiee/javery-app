import { useAuth } from "@/context/AuthContext";
import { showAlert } from "@/lib/alert";
import firebase from "@/lib/firebase";
const { db } = firebase;
import { getAddresses } from "@/services/addressService";
import { useCart } from "@/services/cartService";
import { createOrder } from "@/services/orderService";
import { Address } from "@/types";
import { FontAwesome } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getActiveSellers, isSellerActive } from "@/services/sellerService";
import useLocationStore from "@/store/location.store";

export default function CheckoutScreen() {
  const params = useLocalSearchParams<{
    sellerUid: string;
    selectedAddressId?: string;
    buyNowItem?: string;
  }>();
  const sellerUid = params.sellerUid;
  const { user } = useAuth();
  const { cartItems } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const { location: userLocation, loading: locationLoading } =
    useLocationStore();

  // Filter items for this seller
  const buyNowItem = params.buyNowItem ? JSON.parse(params.buyNowItem) : null;
  const checkoutItems = buyNowItem
    ? [buyNowItem]
    : cartItems.filter((i) => i.sellerUid === sellerUid);
  const sellerName =
    checkoutItems[0]?.sellerName || params.sellerUid
      ? buyNowItem?.sellerName || "Penjual"
      : "Penjual";
  const subtotal = checkoutItems.reduce(
    (sum, item) => sum + item.productPrice * item.quantity,
    0
  );
  // Free shipping for now
  const shippingCost = 0;
  const total = subtotal + shippingCost;

  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadAddresses();
      }
    }, [user, params.selectedAddressId])
  );

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const data = await getAddresses(user!.uid);
      setAddresses(data);

      // If manual selection exists in params
      if (params.selectedAddressId) {
        const manual = data.find((a) => a.id === params.selectedAddressId);
        if (manual) {
          setSelectedAddress(manual);
          return;
        }
      }

      // Auto select logic
      if (
        !selectedAddress ||
        (selectedAddress && !data.find((a) => a.id === selectedAddress.id))
      ) {
        const def = data.find((a) => a.isDefault);
        if (def) setSelectedAddress(def);
        else if (data.length > 0) setSelectedAddress(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    const isActive = await isSellerActive(sellerUid);
    if (!isActive) {
      showAlert("Penjual Tidak Aktif", "Penjual ini tidak menerima pesanan");
      return;
    }
    if (!selectedAddress) {
      showAlert("Alamat Kosong", "Silakan pilih alamat pengiriman.");
      return;
    }
    if (!user) return;

    if (locationLoading) {
      showAlert("Mohon Tunggu", "Sedang mengambil lokasi terkini...");
      return;
    }

    setPlacingOrder(true);
    try {
      // Re-check product availability
      for (const item of checkoutItems) {
        const productSnap = await db.collection("products").doc(item.id).get();
        const productData = productSnap.data();

        if (productData) {
          if (!productData?.isAvailable) {
            showAlert(
              "Produk Tidak Tersedia",
              `Maaf, produk "${item.productName}" sudah tidak tersedia atau kosong.`
            );
            setPlacingOrder(false);
            return;
          }
        } else {
          showAlert(
            "Produk Tidak Ditemukan",
            `Maaf, produk "${item.productName}" tidak ditemukan.`
          );
          setPlacingOrder(false);
          return;
        }
      }

      // Ensure we have coordinates if available, otherwise proceed with null
      const buyerLocation = userLocation
        ? {
            latitude: userLocation.coords.latitude,
            longitude: userLocation.coords.longitude,
          }
        : null;

      if (!buyerLocation) {
        console.warn("User location not available at checkout");
      }

      await createOrder(
        user.uid,
        user.profile?.displayName || user.email?.split("@")[0] || "Pembeli",
        sellerUid,
        sellerName,
        checkoutItems,
        total,
        selectedAddress,
        buyerLocation
      );
      showAlert("Berhasil", "Pesanan berhasil dibuat!", () => {
        router.replace("/orders" as any);
      });
    } catch (error) {
      showAlert("Gagal", "Terjadi kesalahan saat membuat pesanan.");
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "slate", paddingTop: 8 }}
      edges={["bottom"]}
    >
      {/* <SafeAreaView className="flex-1 bg-slate-50" edges={["bottom"]}> */}
      {/* Header - Fixed at Top */}
      <View className="p-4 bg-white border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={handleBack} className="mr-4">
          <FontAwesome name="arrow-left" size={20} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Checkout</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        className="flex-1 mb-30"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Address Section */}
        <View className="bg-white p-4 mb-3">
          <Text className="font-bold text-lg mb-2">Alamat Pengiriman</Text>
          {loading ? (
            <ActivityIndicator />
          ) : addresses.length === 0 ? (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/address/add",
                  params: {
                    source: buyNowItem ? "buyNow" : "checkout",
                    sellerUid,
                    buyNowItem: buyNowItem
                      ? JSON.stringify(buyNowItem)
                      : undefined,
                  },
                })
              }
              className="bg-orange-50 p-4 rounded-xl border border-dashed border-primary items-center"
            >
              <Text className="text-primary font-bold">+ Tambah Alamat</Text>
            </TouchableOpacity>
          ) : (
            <View>
              {selectedAddress ? (
                <View className="border border-primary-100 bg-orange-50 p-4 rounded-xl">
                  <Text className="font-bold text-slate-800">
                    {selectedAddress.name} • {selectedAddress.recipientName}
                  </Text>
                  <Text className="text-slate-600 mt-1">
                    {selectedAddress.phoneNumber}
                  </Text>
                  <Text className="text-slate-500 text-sm mt-1">
                    {selectedAddress.fullAddress}
                  </Text>
                </View>
              ) : (
                <Text>Pilih alamat...</Text>
              )}

              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/address",
                    params: {
                      source: buyNowItem ? "buyNow" : "checkout",
                      sellerUid,
                      buyNowItem: buyNowItem
                        ? JSON.stringify(buyNowItem)
                        : undefined,
                    },
                  })
                }
                className="mt-3"
              >
                <Text className="text-primary font-bold text-center">
                  Ganti Alamat
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Items Summary */}
        <View className="bg-white p-4 mb-3">
          <View className="flex-row items-center mb-3">
            <FontAwesome name="shopping-bag" size={14} color="#f97316" />
            <Text className="font-bold text-slate-700 ml-2">{sellerName}</Text>
          </View>
          {checkoutItems.map((item) => (
            <View key={item.id} className="flex-row justify-between mb-2">
              <Text className="text-slate-600 flex-1">
                {item.productName} (x{item.quantity})
              </Text>
              <Text className="font-medium">
                Rp {(item.productPrice * item.quantity).toLocaleString("id-ID")}
              </Text>
            </View>
          ))}
        </View>

        {/* Payment Method */}
        <View className="bg-white p-4 mb-3">
          <Text className="font-bold text-lg mb-3">Metode Pembayaran</Text>

          <View className="flex-row items-center p-3 border border-primary bg-orange-50 rounded-xl mb-2">
            <View className="w-4 h-4 rounded-full border border-primary items-center justify-center mr-3">
              <View className="w-2 h-2 rounded-full bg-primary" />
            </View>
            <View>
              <Text className="font-bold text-slate-800">
                Bayar Ditempat (COD)
              </Text>
              <Text className="text-xs text-slate-500">
                Bayar tunai saat pesanan sampai
              </Text>
            </View>
          </View>

          <View className="flex-row items-center p-3 border border-gray-100 bg-gray-50 rounded-xl opacity-50 mb-2">
            <View className="w-4 h-4 rounded-full border border-gray-300 mr-3" />
            <View>
              <Text className="font-bold text-slate-400">Transfer Bank</Text>
              <Text className="text-xs text-slate-400">Belum tersedia</Text>
            </View>
          </View>

          <View className="flex-row items-center p-3 border border-gray-100 bg-gray-50 rounded-xl opacity-50">
            <View className="w-4 h-4 rounded-full border border-gray-300 mr-3" />
            <View>
              <Text className="font-bold text-slate-400">QRIS</Text>
              <Text className="text-xs text-slate-400">Belum tersedia</Text>
            </View>
          </View>
        </View>

        <View className="h-4" />

        {/* Footer Content */}
        <View className="bg-white p-4 border-t border-gray-100 pb-10">
          <View className="flex-row justify-between mb-2">
            <Text className="text-slate-500">Subtotal Produk</Text>
            <Text className="font-medium">
              Rp {subtotal.toLocaleString("id-ID")}
            </Text>
          </View>
          <View className="flex-row justify-between mb-4">
            <Text className="text-slate-500">Ongkos Kirim</Text>
            <Text className="font-medium text-green-600">Gratis</Text>
          </View>

          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-slate-800">
              Total Pembayaran
            </Text>
            <Text className="text-xl font-bold text-primary">
              Rp {total.toLocaleString("id-ID")}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handlePlaceOrder}
            disabled={placingOrder || !selectedAddress}
            className={`p-4 rounded-xl items-center mb-8 ${
              placingOrder || !selectedAddress ? "bg-gray-300" : "bg-primary"
            }`}
          >
            {placingOrder ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Buat Pesanan</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
