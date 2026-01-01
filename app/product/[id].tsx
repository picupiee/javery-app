import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import { showAlert, showConfirm } from "@/lib/alert";
import { db } from "@/lib/firebase";
import { useCart } from "@/services/cartService";
import { getProductById } from "@/services/productService";
import { isSellerActive } from "@/services/sellerService";
import { Product } from "@/types";
import { FontAwesome } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  Modal,
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
  const [sellerPhone, setSellerPhone] = useState<string | null>(null);
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [sellerPhoto, setSellerPhoto] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (typeof id === "string") {
        const data = await getProductById(id);
        setProduct(data);
        if (data?.sellerUid) {
          fetchSellerPhone(data.sellerUid);
        }
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const fetchSellerPhone = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.profile?.phoneNumber) {
          setSellerPhone(data.profile.phoneNumber);
        }
        if (data.photoURL) {
          setSellerPhoto(data.photoURL);
        }
      }
    } catch (e) {
      console.error("Error fetching seller phone:", e);
    }
  };

  const handleChatSeller = () => {
    if (!sellerPhone) return;
    const url = `https://wa.me/${sellerPhone}`;
    Linking.openURL(url);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    try {
      await addToCart({
        id: product.id,
        productName: product.name,
        productPrice: product.price,
        productImage: product.imageUrl,
        quantity: 1, // Default 1
        sellerUid: product.sellerUid,
        sellerName: product.sellerName || "Toko",
      });
      showConfirm(
        "Berhasil",
        "Produk ditambahkan ke keranjang!",
        () => router.push("/(tabs)/cart"),
        undefined,
        "Lihat Keranjang",
        "Lanjut Belanja"
      );
    } catch (e) {
      Alert.alert("Gagal", "Tidak dapat menambahkan ke keranjang.");
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product || isOutOfStock) return;

    const isActive = await isSellerActive(product.sellerUid);
    if (!isActive) {
      showAlert(
        "Toko tidak aktif",
        "Toko sedang tidak aktif, silahkan hubungi pemilik toko via WhatsApp atau coba lagi nanti.",
        () => {}
      );
      return;
    }

    const buyNowItem = {
      id: product.id,
      productName: product.name,
      productPrice: product.price,
      productImage: product.imageUrl,
      quantity: 1,
      sellerUid: product.sellerUid,
      sellerName: product.sellerName || "Toko",
    };

    router.push({
      pathname: "/checkout" as any,
      params: {
        sellerUid: product.sellerUid,
        buyNowItem: JSON.stringify(buyNowItem),
      },
    });
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500 font-medium">
          Produk tidak ditemukan
        </Text>
        <TouchableOpacity onPress={handleBack} className="mt-4">
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
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setIsImageModalVisible(true)}
            className="w-full h-80 bg-gray-100 relative"
          >
            {product.imageUrl ? (
              <ImageWithSkeleton
                source={{ uri: product.imageUrl }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
                transition={500}
              />
            ) : (
              <View className="w-full h-full items-center justify-center">
                <FontAwesome name="image" size={60} color="#ccc" />
              </View>
            )}

            {/* Back Button Overlay */}
            <SafeAreaView className="absolute top-0 left-0 w-full">
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  handleBack();
                }}
                className="ml-4 mt-2 w-10 h-10 bg-white/80 rounded-full items-center justify-center"
              >
                <FontAwesome name="arrow-left" size={20} color="black" />
              </TouchableOpacity>
            </SafeAreaView>
          </TouchableOpacity>

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

            {/* Seller Info */}
            <View className="border-t border-gray-100 pt-4 mb-4 flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-3 overflow-hidden">
                  {sellerPhoto ? (
                    <ImageWithSkeleton
                      source={{ uri: sellerPhoto }}
                      style={{ width: "100%", height: "100%" }}
                      contentFit="cover"
                      borderRadius={20}
                    />
                  ) : (
                    <Text className="text-primary-600 font-bold">
                      {(product.sellerName || "T").charAt(0).toUpperCase()}
                    </Text>
                  )}
                </View>
                <View>
                  <Text className="text-xs text-gray-400 font-medium">
                    Dijual oleh:
                  </Text>
                  <Text className="text-base font-bold text-slate-700">
                    {product.sellerName || "Toko"}
                  </Text>
                </View>
              </View>

              {sellerPhone && (
                <TouchableOpacity
                  onPress={handleChatSeller}
                  className="bg-green-100 px-3 py-2 rounded-full flex-row items-center border border-green-200"
                >
                  <FontAwesome name="whatsapp" size={16} color="#16a34a" />
                  <Text className="text-green-700 font-bold ml-1 text-xs">
                    Chat Penjual
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>

        <SafeAreaView
          edges={["bottom"]}
          className="bg-white border-t border-gray-100 p-4 shadow-lg"
        >
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={handleAddToCart}
              disabled={isOutOfStock || adding}
              className={` p-2 m-2 justify-center rounded-xl border border-primary-200 ${
                isOutOfStock || adding
                  ? "bg-gray-50 border-gray-200"
                  : "bg-orange-50"
              }`}
            >
              {adding ? (
                <ActivityIndicator color="#f97316" />
              ) : (
                <FontAwesome
                  name="shopping-cart"
                  size={24}
                  color={isOutOfStock || adding ? "gray" : "#f97316"}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleBuyNow}
              disabled={isOutOfStock || adding}
              className={`flex-[2] m-2 p-4 rounded-xl ${
                isOutOfStock || adding ? "bg-gray-300" : "bg-primary"
              }`}
            >
              <Text className="text-white font-bold text-center">
                {isOutOfStock ? "Stok Habis" : "Beli Sekarang"}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* Full Screen Image Modal */}
      <Modal
        visible={isImageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsImageModalVisible(false)}
      >
        <View className="flex-1 bg-black/90 items-center justify-center relative">
          <TouchableOpacity
            style={{ width: "100%", height: "100%", position: "absolute" }}
            onPress={() => setIsImageModalVisible(false)}
          />

          {product.imageUrl && (
            <ImageWithSkeleton
              source={{ uri: product.imageUrl }}
              style={{
                width: Dimensions.get("window").width,
                height: Dimensions.get("window").height * 0.7,
              }}
              contentFit="contain"
            />
          )}

          <TouchableOpacity
            onPress={() => setIsImageModalVisible(false)}
            className="absolute top-12 right-6 w-10 h-10 bg-white/20 rounded-full items-center justify-center"
          >
            <FontAwesome name="times" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}
