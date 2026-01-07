import { getFeaturedProducts, searchProducts } from "@/services/productService";
import { Product } from "@/types";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserLocation } from "@/hooks/useLocation";
import { calculateDistance } from "@/utils/geoUtils";


export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { location, error: locError } = useUserLocation()

  // Simple manual debounce for now since we don't have the hook file yet
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      if (query.trim().length > 0) {
        const products = await searchProducts(query);
        setResults(products);
      } else {
        // Load default/recent products when search is empty (e.g. limit 24)
        const products = await getFeaturedProducts(24);
        setResults(products);
      }
      setLoading(false);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const renderProductItem = ({ item }: { item: Product }) => {
    const userLocation = location ? { latitude: location.coords.latitude, longitude: location.coords.longitude } : null;
    const displayDistance = calculateDistance(userLocation, item.storeLocation);
    return (

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
          {Platform.OS !== 'web' && (
            <View className="absolute bottom-2 right-2">
              <View className="flex-row items-center gap-1">
                <FontAwesome name="location-arrow" size={10} color="#94a3b8" />
                <Text className="text-xs text-slate-400 antialiased">{displayDistance || "..Km"}</Text>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    )
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      {/* Header */}
      <View className="px-5 py-4 bg-white border-b border-slate-200">
        <Text className="font-bold text-2xl text-primary">Cari Produk</Text>
      </View>

      {/* Search Bar */}
      <View className="px-5 py-4 bg-white">
        <View className="flex-row items-center bg-slate-100 rounded-xl px-4 py-3">
          <FontAwesome name="search" size={18} color="#94a3b8" />
          <TextInput
            placeholder="Cari produk..."
            placeholderTextColor="#94a3b8"
            value={query}
            onChangeText={setQuery}
            className="flex-1 ml-3 font-medium text-sm text-slate-800"
          />
        </View>
      </View>

      {/* Results */}
      <ScrollView className="flex-1">
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#000" />
          </View>
        ) : (
          <View className="bg-white pt-5 pb-20">
            <View className="px-5 mb-4">
              <Text className="font-bold text-base text-slate-800">
                {query.trim() === "" ? "Produk Terbaru" : `Hasil (${results.length})`}
              </Text>
            </View>
            {results.length > 0 ? (
              <View className="px-5">
                <View className="flex-row flex-wrap justify-between">
                  {results.map((item: Product) => (
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
                  Produk tidak ditemukan
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
