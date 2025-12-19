import { db } from "@/lib/firebase";
import { getProductsBySeller } from "@/services/productService";
import { Seller } from "@/services/sellerService";
import { Product } from "@/types";
import { FontAwesome } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";
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
        const productsData = await getProductsBySeller(id);
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching seller data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [id]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/account");
    }
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      className="bg-white rounded-xl overflow-hidden border border-slate-200 mb-3"
      onPress={() => router.push(`/product/${item.id}`)}
    >
      <View className="h-36 bg-slate-50 w-full">
        {item.imageUrl ? (
          <ImageWithSkeleton
            source={{ uri: item.imageUrl }}
            className="w-full h-full"
            contentFit="cover"
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
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="mt-2 text-slate-600">Memuat toko...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      {/* Header */}
      <View className="px-5 py-4 bg-white border-b border-slate-200 flex-row items-center">
        <TouchableOpacity onPress={handleBack} className="mr-3">
          <FontAwesome name="arrow-left" size={20} color="#1e293b" />
        </TouchableOpacity>
        <Text className="font-bold text-xl text-slate-800">Toko</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Seller Info */}
        <View className="bg-orange-50 border-b border-orange-100">
          <View className="px-5 py-6">
            <View className="flex-row items-center">
              <View className="w-16 h-16 bg-orange-200 rounded-full items-center justify-center mr-4 overflow-hidden">
                {seller?.photoURL ? (
                  <ImageWithSkeleton
                    source={{ uri: seller.photoURL }}
                    style={{ width: "100%", height: "100%" }}
                    borderRadius={32}
                  />
                ) : (
                  <FontAwesome name="shopping-bag" size={28} color="#f97316" />
                )}
              </View>
              <View className="flex-1">
                <Text className="font-bold text-xl text-slate-800 mb-1">
                  {seller?.storeName || "Toko"}
                </Text>
                {/* Email address removed as requested */}
              </View>
            </View>
          </View>
        </View>

        {/* Products Section */}
        <View className="bg-white pt-5 pb-20">
          <View className="px-5 mb-4">
            <Text className="font-bold text-base text-slate-800">
              Produk ({products.length})
            </Text>
          </View>
          {products.length > 0 ? (
            <View className="px-5">
              <View className="flex-row flex-wrap justify-between">
                {products.map((item) => (
                  <View key={item.id} className="w-[48%] mb-3">
                    {renderProductItem({ item })}
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View className="items-center py-10">
              <FontAwesome name="inbox" size={48} color="#cbd5e1" />
              <Text className="text-slate-400 mt-4 font-medium">
                Tidak ada produk tersedia
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
