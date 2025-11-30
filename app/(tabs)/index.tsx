import { getFeaturedProducts } from "@/services/productService";
import { getActiveSellers, Seller } from "@/services/sellerService";
import { Product } from "@/types";
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
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [sellersData, productsData] = await Promise.all([
        getActiveSellers(),
        getFeaturedProducts(),
      ]);
      setSellers(sellersData);
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching home data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderSellerItem = ({ item }: { item: Seller }) => (
    <TouchableOpacity
      className="mr-4 items-center"
      // onPress={() => router.push(`/seller/${item.uid}`)} // Future implementation
    >
      <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center mb-2 overflow-hidden border border-gray-100">
        {/* Placeholder for seller image if not available */}
        <FontAwesome name="shopping-bag" size={24} color="gray" />
      </View>
      <Text
        className="text-xs font-quicksand-medium text-center w-20"
        numberOfLines={1}
      >
        {item.storeName}
      </Text>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      className="w-[48%] mb-4 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      onPress={() => router.push(`/product/${item.id}`)}
    >
      <View className="h-40 bg-gray-100 w-full">
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <FontAwesome name="image" size={40} color="#ccc" />
          </View>
        )}
      </View>
      <View className="p-3">
        <Text className="font-quicksand-bold text-base mb-1" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="font-quicksand-bold text-primary">
          Rp {item.price.toLocaleString()}
        </Text>
        <Text
          className="text-xs text-gray-500 mt-1 font-quicksand-medium"
          numberOfLines={1}
        >
          {item.category || "Uncategorized"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="px-5 py-4 flex-row justify-between items-center">
        <View>
          <Text className="font-quicksand-bold text-2xl text-primary">
            Javery
          </Text>
          <Text className="font-quicksand-medium text-gray-500 text-xs">
            Fresh from the farm
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/(tabs)/cart")}>
          <FontAwesome name="shopping-cart" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchData} />
        }
      >
        {/* Active Sellers Section */}
        <View className="py-4">
          <View className="px-5 flex-row justify-between items-center mb-3">
            <Text className="font-quicksand-bold text-lg">Active Sellers</Text>
            {/* <Text className="text-primary font-quicksand-medium text-sm">See All</Text> */}
          </View>
          <FlatList
            data={sellers}
            renderItem={renderSellerItem}
            keyExtractor={(item) => item.uid}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            ListEmptyComponent={
              <Text className="text-gray-400 italic ml-5">
                No active sellers found.
              </Text>
            }
          />
        </View>

        {/* Featured Products Section */}
        <View className="px-5 pb-20">
          <Text className="font-quicksand-bold text-lg mb-3">
            Featured Products
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {products.map((item) => (
              <View key={item.id} className="w-[48%]">
                {renderProductItem({ item })}
              </View>
            ))}
          </View>
          {products.length === 0 && !refreshing && (
            <Text className="text-center text-gray-400 mt-10">
              No products available.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
