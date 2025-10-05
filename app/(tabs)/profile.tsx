import useAuthStore from "@/store/auth.store";
import React from "react";
import { Pressable, Text, View } from "react-native";

const profile = () => {
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View className="flex-1 justify-center items-center">
      <Pressable onPress={handleLogout} className="p-2 rounded-md bg-red-500">
        <Text className="font-quicksand-semibold text-lg text-white">
          Logout
        </Text>
      </Pressable>
    </View>
  );
};

export default profile;
