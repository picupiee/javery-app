import { searchProducts } from "@/services/productService";
import { Product } from "@/types";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Simple manual debounce for now since we don't have the hook file yet
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 0) {
        setLoading(true);
        const products = await searchProducts(query);
        setResults(products);
        setLoading(false);
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      className="flex-row bg-white p-3 mb-3 rounded-xl shadow-sm border border-gray-100"
      onPress={() => router.push(`/product/${item.id}`)}
    >
      <View className="w-20 h-20 bg-gray-100 rounded-lg mr-4 overflow-hidden">
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <FontAwesome name="image" size={24} color="#ccc" />
          </View>
        )}
      </View>
      <View className="flex-1 justify-center">
        <Text className="font-bold text-base mb-1">{item.name}</Text>
        <Text className="font-bold text-primary">
          Rp {item.price.toLocaleString()}
        </Text>
        <Text className="text-xs text-gray-500 mt-1 font-medium">
          {item.category}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white px-5" edges={["top"]}>
      <View className="py-4">
        <Text className="font-bold text-2xl text-primary mb-4">
          Search
        </Text>
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
          <FontAwesome name="search" size={20} color="gray" />
          <TextInput
            className="flex-1 ml-3 font-medium text-base"
            placeholder="Search for products..."
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <FontAwesome name="times-circle" size={20} color="gray" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            query.length > 0 ? (
              <View className="items-center mt-10">
                <Text className="text-gray-500 font-medium">
                  No products found for "{query}"
                </Text>
              </View>
            ) : (
              <View className="items-center mt-10">
                <FontAwesome name="search" size={50} color="#eee" />
                <Text className="text-gray-400 mt-4 font-medium">
                  Type to search for fresh products
                </Text>
              </View>
            )
          }
        />
      )}
    </SafeAreaView>
  );
}
