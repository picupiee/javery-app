import { getSellerProfile } from "@/services/sellerService";
import { Product } from "@/types";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Platform, Text, TouchableOpacity, View } from "react-native";
import ImageWithSkeleton from "./ImageWithSkeleton";
import { calculateDistance } from "../utils/geoUtils";

interface ProductCardHomeProps {
  item: Product;
  className?: string;
  userLocation: { latitude: number; longitude: number };
}

const ProductCardHome: React.FC<ProductCardHomeProps> = ({
  item,
  className,
  userLocation,
}) => {
  const [sellerPhoto, setSellerPhoto] = useState<string | null>(
    item.photoURL || null
  );
  const [sellerLocation, setSellerLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(item.storeLocation || null);

  useEffect(() => {
    const fetchSellerProfile = async () => {
      if ((!item.photoURL || !item.storeLocation) && item.sellerUid) {
        const profile = await getSellerProfile(item.sellerUid);
        if (profile) {
          if (!item.photoURL && profile.photoURL) {
            setSellerPhoto(profile.photoURL);
          }
          if (!item.storeLocation && profile.storeLocation) {
            setSellerLocation(profile.storeLocation);
          }
        }
      }
    };
    fetchSellerProfile();
  }, [item.sellerUid, item.photoURL]);

  const distance = calculateDistance(
    userLocation,
    item.storeLocation || sellerLocation
  );

  return (
    <TouchableOpacity
      className={`bg-white rounded-xl overflow-hidden border border-slate-200 mb-3 ${className}`}
      onPress={() => router.push(`/product/${item.id}`)}
    >
      <View className="h-36 bg-slate-50 w-full">
        <View className={`${!item.isAvailable ? "opacity-65" : ""}`}>
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
        {!item.isAvailable && (
          <View className="absolute top-2 left-2 bg-red-600/90 px-2 py-1 rounded">
            <Text className="text-[10px] text-white font-bold">Stok Habis</Text>
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
        <Text className="text-[10px] font-medium text-slate-400 mb-1 border-t border-slate-200 pt-1">
          Dijual Oleh
        </Text>
        <View className="flex-row items-center">
          <View className="flex-row items-center">
            {sellerPhoto ? (
              <Image
                source={{ uri: sellerPhoto }}
                className="w-6 h-6 rounded-full mr-1"
              />
            ) : (
              <FontAwesome name="shopping-bag" size={16} color="#94a3b8" />
            )}
            <Text
              className="text-xs text-slate-800 font-medium"
              numberOfLines={1}
            >
              {item.sellerName}
            </Text>
          </View>
          {Platform.OS !== "web" && (
            <View className="absolute right-0">
              <View className="flex-row items-center gap-1">
                <FontAwesome name="location-arrow" size={10} color="#94a3b8" />
                <Text className="text-[10px] text-slate-600 antialiased">
                  {distance || "2 Km"}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCardHome;
