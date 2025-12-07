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
  Image,
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

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [sellersData, productsData, pingsData] = await Promise.all([
        getActiveSellers(),
        getFeaturedProducts(),
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
    fetchData();

    // Subscribe to real-time ping updates
    const unsubscribe = subscribeToRecentPings((updatedPings) => {
      console.log("Pings updated:", updatedPings.length);
      setPings(updatedPings);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const renderSellerItem = ({ item }: { item: Seller }) => (
    <TouchableOpacity
      className="mr-4 items-center"
      onPress={() => router.push(`/seller/${item.uid}` as any)}
    >
      <View className="w-16 h-16 bg-slate-100 rounded-full items-center justify-center mb-2 border border-slate-200">
        <FontAwesome name="shopping-bag" size={24} color="#94a3b8" />
      </View>
      <Text
        className="text-xs font-medium text-center w-20 text-slate-800"
        numberOfLines={1}
      >
        {item.storeName}
      </Text>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      className="bg-white rounded-xl overflow-hidden border border-slate-200 mb-3"
      onPress={() => router.push(`/product/${item.id}`)}
    >
      <View className="h-36 bg-slate-50 w-full">
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <FontAwesome name="image" size={36} color="#cbd5e1" />
          </View>
        )}
      </View>
      <View className="p-3">
        <Text
          className="font-bold text-sm text-slate-800 mb-1"
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text className="font-bold text-primary text-base mb-1">
          Rp {item.price.toLocaleString()}
        </Text>
        <Text className="text-xs text-slate-400 font-medium" numberOfLines={1}>
          {item.category}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      {/* Header */}
      <View className="px-5 py-4 bg-white border-b border-slate-200">
        <Text className="font-bold text-2xl text-primary">Javery</Text>
        <Text className="font-medium text-slate-500 text-xs mt-0.5">
          Segar dari Toko
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
                    <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-3">
                      <FontAwesome
                        name="shopping-bag"
                        size={18}
                        color="#f97316"
                      />
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
            renderItem={renderSellerItem}
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
                  {renderProductItem({ item })}
                </View>
              ))}
            </View>
          </View>
          {products.length === 0 && !refreshing && (
            <Text className="text-center text-gray-400 mt-10">
              Tidak ada produk tersedia.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
