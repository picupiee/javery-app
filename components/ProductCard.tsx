import { Product } from "@/types";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import ImageWithSkeleton from "./ImageWithSkeleton";


interface ProductCardProps {
  item: Product;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ item, className }) => {

  return (
    <TouchableOpacity
      className={`bg-white rounded-xl overflow-hidden border border-slate-200 mb-3 ${className}`}
      onPress={() => router.push(`/product/${item.id}`)}
    >
      <View className="h-36 bg-slate-50 w-full">
        {item.imageUrl ? (
          <ImageWithSkeleton
            source={{ uri: item.imageUrl }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            transition={500}
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
};

export default ProductCard;
