import { Product, SellerProfile } from "@/types";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import ImageWithSkeleton from "./ImageWithSkeleton";

interface ProductCardHomeProps {
  item: Product;
  className?: string;
}

const ProductCardHome: React.FC<ProductCardHomeProps> = ({
  item,
  className,
}) => {
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
        <View className="flex-row items-center gap-2">
          {item.photoURL ? (
            <Image
              source={{ uri: item.photoURL }}
              className="w-6 h-6 rounded-full mr-2"
            />
          ) : (
            <FontAwesome name="shopping-bag" size={16} color="#94a3b8" />
          )}
          <Text
            className="text-xs text-slate-400 font-medium"
            numberOfLines={1}
          >
            {item.sellerName}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCardHome;
