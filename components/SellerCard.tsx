import { Seller } from "@/services/sellerService";
import { FontAwesome } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface SellerCardProps {
  item: Seller;
}

const SellerCard: React.FC<SellerCardProps> = ({ item }) => {
  return (
    <TouchableOpacity
      className="mr-4 items-center"
      onPress={() => router.push(`/seller/${item.uid}` as any)}
    >
      <View className="w-16 h-16 bg-slate-100 rounded-full items-center justify-center mb-2 border border-slate-200 overflow-hidden">
        {item.photoURL ? (
          <Image
            source={{ uri: item.photoURL }}
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <FontAwesome name="shopping-bag" size={24} color="#94a3b8" />
        )}
      </View>
      <Text
        className="text-xs font-medium text-center w-20 text-slate-800"
        numberOfLines={1}
      >
        {item.storeName}
      </Text>
      <FontAwesome name="circle" size={16} color="#58e421ff" className="absolute top-1 right-3" />
    </TouchableOpacity>
  );
};

export default SellerCard;
