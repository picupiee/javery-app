import { getProductById } from "@/services/productService";
import { Product } from "@/types";
import { FontAwesome } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
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

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (typeof id === "string") {
        const data = await getProductById(id);
        setProduct(data);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    // Stage 3: Implement Cart Logic
    console.log("Add to cart:", product?.name);
    router.push("/(tabs)/cart");
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500 font-medium">
          Produk tidak ditemukan
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-primary font-bold">Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isUnlimited = product.isUnlimited;
  const isOutOfStock = !isUnlimited && product.stock === 0;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 bg-white">
        <ScrollView className="flex-1">
          {/* Image Header */}
          <View className="w-full h-80 bg-gray-100 relative">
            {product.imageUrl ? (
              <Image
                source={{ uri: product.imageUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full items-center justify-center">
                <FontAwesome name="image" size={60} color="#ccc" />
              </View>
            )}

            {/* Back Button Overlay */}
            <SafeAreaView className="absolute top-0 left-0 w-full">
              <TouchableOpacity
                onPress={() => router.back()}
                className="ml-4 mt-2 w-10 h-10 bg-white/80 rounded-full items-center justify-center"
              >
                <FontAwesome name="arrow-left" size={20} color="black" />
              </TouchableOpacity>
            </SafeAreaView>
          </View>

          {/* Content */}
          <View className="p-6 -mt-6 bg-white rounded-t-3xl flex-1">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-2xl font-bold flex-1 mr-2">
                {product.name}
              </Text>
              <Text className="text-xl font-bold text-primary">
                Rp {product.price.toLocaleString()}
              </Text>
            </View>

            <View className="flex-row items-center mb-6">
              <View className="bg-gray-100 px-3 py-1 rounded-full mr-2">
                <Text className="text-xs text-gray-600 font-medium">
                  {product.category}
                </Text>
              </View>
              <View
                className={`${
                  isOutOfStock ? "bg-red-100" : "bg-green-100"
                } px-3 py-1 rounded-full`}
              >
                <Text
                  className={`text-xs ${
                    isOutOfStock ? "text-red-700" : "text-green-700"
                  } font-medium`}
                >
                  Stok: {isUnlimited ? "Tersedia" : product.stock}
                </Text>
              </View>
            </View>

            <Text className="text-lg font-bold mb-2">Deskripsi</Text>
            <Text className="text-gray-600 font-medium leading-6 mb-8">
              {product.description || "Tidak ada deskripsi."}
            </Text>

            {/* Seller Info Placeholder */}
            <View className="border-t border-gray-100 pt-4 mb-4">
              <Text className="text-sm text-gray-400 font-medium">
                Dijual oleh: {product.sellerName || "Toko"}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action Bar */}
        <SafeAreaView
          edges={["bottom"]}
          className="bg-white border-t border-gray-100 p-4 shadow-lg"
        >
          <TouchableOpacity
            onPress={handleAddToCart}
            disabled={isOutOfStock}
            className={`mx-6 mb-8 p-4 rounded-xl ${
              isOutOfStock ? "bg-gray-300" : "bg-primary"
            }`}
          >
            <Text className="text-white font-bold text-lg font-bold text-center">
              {isOutOfStock ? "Habis" : "Tambah ke Keranjang"}
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </>
  );
}
