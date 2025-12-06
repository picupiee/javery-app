import { db } from "@/lib/firebase";
import { Seller } from "@/services/sellerService";
import { Product } from "@/types";
import { FontAwesome } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SellerStore() {
  const { id } = useLocalSearchParams();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellerData = async () => {
      if (!id || typeof id !== "string") return;

      setLoading(true);
      try {
        // Fetch seller info
        const sellerDoc = await getDocs(
          query(collection(db, "sellers"), where("uid", "==", id))
        );

        if (!sellerDoc.empty) {
          const sellerData = sellerDoc.docs[0].data() as Seller;
          setSeller(sellerData);
        }

        // Fetch seller's products
        const productsQuery = query(
          collection(db, "products"),
          where("ownerUid", "==", id)
        );
        const productsSnapshot = await getDocs(productsQuery);
        const productsData = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];

        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching seller data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [id]);

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
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="mt-2 text-gray-600">Loading store...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="px-5 py-4 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <FontAwesome name="arrow-left" size={20} color="black" />
        </TouchableOpacity>
        <Text className="font-quicksand-bold text-xl flex-1">Store</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Seller Info */}
        <View className="px-5 py-6 bg-orange-50 border-b border-orange-100">
          <View className="flex-row items-center">
            <View className="w-20 h-20 bg-orange-200 rounded-full items-center justify-center mr-4">
              <FontAwesome name="shopping-bag" size={32} color="#f97316" />
            </View>
            <View className="flex-1">
              <Text className="font-quicksand-bold text-2xl mb-1">
                {seller?.storeName || "Store"}
              </Text>
              <Text className="text-gray-600 font-quicksand-medium text-sm">
                {seller?.email || ""}
              </Text>
            </View>
          </View>
        </View>

        {/* Products Section */}
        <View className="px-5 py-6">
          <Text className="font-quicksand-bold text-lg mb-4">
            Products ({products.length})
          </Text>
          {products.length > 0 ? (
            <View className="flex-row flex-wrap justify-between">
              {products.map((item) => (
                <View key={item.id} className="w-[48%]">
                  {renderProductItem({ item })}
                </View>
              ))}
            </View>
          ) : (
            <View className="items-center py-10">
              <FontAwesome name="inbox" size={48} color="#ccc" />
              <Text className="text-gray-400 mt-4 font-quicksand-medium">
                No products available
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
