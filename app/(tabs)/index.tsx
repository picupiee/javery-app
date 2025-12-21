import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import ProductCard from "@/components/ProductCard";
import SellerCard from "@/components/SellerCard";
import {
  formatTimeAgo,
  getRecentPings,
  subscribeToRecentPings,
} from "@/services/pingService";
import { getFeaturedProducts } from "@/services/productService";
import { getActiveSellers, Seller } from "@/services/sellerService";
import { Ping, Product } from "@/types";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [pings, setPings] = useState<Ping[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [productLimit, setProductLimit] = useState(6);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [sellersData, productsData, pingsData] = await Promise.all([
        getActiveSellers(),
        getFeaturedProducts(productLimit),
        getRecentPings(),
      ]);
      setSellers(sellersData);
      setProducts(productsData);
      setPings(pingsData);
    } catch (error) {
      console.error("Error fetching home data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(); // Fetch whenever productLimit changes too (called inside fetchData logic if we used dependency, but here we call manually)
  }, [productLimit]); // Re-fetch when limit changes

  useEffect(() => {
    // Subscribe to real-time ping updates
    const unsubscribe = subscribeToRecentPings((updatedPings) => {
      setPings(updatedPings);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleLoadMore = () => {
    if (products.length >= 8) {
      router.push("/(tabs)/search");
    } else {
      setProductLimit((prev) => prev + 6);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      {/* Header */}
      <View className="px-5 py-4 bg-white border-b border-slate-200">
        <Text className="font-bold text-2xl text-primary">Javery</Text>
        <Text className="font-medium text-slate-500 text-xs mt-0.5">
          Japri Ahlinya !
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchData} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Ping Notifications Section */}
        {pings.length > 0 && (
          <View className="bg-orange-50 border-b border-orange-100">
            <View className="px-5 py-4 flex-row justify-between items-center">
              <Text className="font-bold text-base text-slate-800">
                🔔 Pembaruan Terbaru
              </Text>
              <TouchableOpacity
                onPress={async () => {
                  const freshPings = await getRecentPings();
                  setPings(freshPings);
                }}
                className="p-2"
              >
                <FontAwesome name="refresh" size={16} color="#f97316" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={pings}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="mr-3 bg-white rounded-xl p-4 border border-orange-200"
                  style={{ width: 280 }}
                  onPress={() =>
                    router.push(`/seller/${item.sellerUid}` as any)
                  }
                >
                  <View className="flex-row items-center mb-2">
                    <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-3 overflow-hidden">
                      {item.photoURL ? (
                        <ImageWithSkeleton
                          source={{ uri: item.photoURL }}
                          style={{ width: "100%", height: "100%" }}
                          borderRadius={20}
                        />
                      ) : (
                        <FontAwesome
                          name="shopping-bag"
                          size={18}
                          color="#f97316"
                        />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text
                        className="font-bold text-sm text-slate-800"
                        numberOfLines={1}
                      >
                        {item.storeName}
                      </Text>
                      <Text className="text-xs text-slate-400 font-medium">
                        {formatTimeAgo(item.createdAt)}
                      </Text>
                    </View>
                  </View>
                  <Text
                    className="text-sm text-slate-600 font-medium leading-5"
                    numberOfLines={2}
                  >
                    {item.message}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.sellerUid}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingBottom: 16,
              }}
            />
          </View>
        )}

        {/* Active Sellers Section */}
        <View className="bg-white py-5 mb-2">
          <View className="px-5 mb-3">
            <Text className="font-bold text-base text-slate-800">
              Penjual Aktif
            </Text>
          </View>
          <FlatList
            data={sellers}
            renderItem={({ item }) => <SellerCard item={item} />}
            keyExtractor={(item) => item.uid}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          />
        </View>

        {/* Featured Products Section */}
        <View className="bg-white pt-5 pb-20">
          <View className="px-5 mb-4">
            <Text className="font-bold text-base text-slate-800">
              Produk Pilihan
            </Text>
          </View>
          <View className="px-5">
            <View className="flex-row flex-wrap justify-between">
              {products.map((item) => (
                <View key={item.id} className="w-[48%] mb-3">
                  <ProductCard item={item} />
                </View>
              ))}
            </View>
          </View>
          {products.length === 0 && !refreshing && (
            <Text className="text-center text-gray-400 mt-10">
              Tidak ada produk tersedia.
            </Text>
          )}

          {products.length > 0 && (
            <TouchableOpacity
              onPress={handleLoadMore}
              className="mx-5 mb-5 p-3 rounded-lg bg-gray-100 items-center active:bg-gray-200"
            >
              <Text className="text-slate-600 font-medium">
                {products.length >= 8 ? "Lihat Semua di Pencarian" : "Lebih Banyak"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
