import { auth, db } from "@/lib/firebase";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateProfile() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    // Wait for auth to be ready
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setAuthReady(true);
      } else {
        // If no user, redirect to sign-in
        router.replace("/(auth)/sign-in");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCreateProfile = async () => {
    if (!name) {
      Alert.alert("Error", "Please enter your full name");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "Session expired. Please sign in again.");
      setTimeout(() => {
        router.replace("/(auth)/sign-in");
      }, 1500);
      return;
    }

    setLoading(true);

    try {
      // Update Firebase Auth display name
      await updateProfile(user, { displayName: name });

      // Update user profile in Firestore to add buyer role
      await setDoc(
        doc(db, "users", user.uid),
        {
          displayName: name,
          roles: {
            buyer: true,
            seller: true, // Keep seller role if they had it
          },
        },
        { merge: true }
      );

      if (Platform.OS === "web") {
        window.alert("Your buyer profile has been created successfully.");
        router.replace("/");
      } else {
        Alert.alert(
          "Welcome!",
          "Your buyer profile has been created successfully.",
          [{ text: "OK", onPress: () => router.replace("/") }]
        );
      }
    } catch (error: any) {
      console.error("Create Profile error:", error.code, error.message);
      Alert.alert("Error", "Failed to create profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while waiting for auth
  if (!authReady) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="text-slate-600 mt-4">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center px-6 py-8">
          {/* Header */}
          <View className="items-center mb-10">
            <View className="w-20 h-20 bg-orange-100 rounded-full items-center justify-center mb-4">
              <Text className="text-4xl">🍊</Text>
            </View>
            <Text className="text-3xl font-bold text-primary mb-2">Javery</Text>
            <Text className="text-slate-500 font-medium text-center">
              Fresh from the farm
            </Text>
          </View>

          {/* Welcome Text */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-slate-800 mb-2">
              Complete Your Profile
            </Text>
            <Text className="text-slate-600 font-medium">
              You already have an account. Enter your name to start shopping!
            </Text>
          </View>

          {/* Form */}
          <View className="mb-6">
            <Text className="text-slate-700 mb-2 font-semibold text-sm">
              Full Name
            </Text>
            <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 py-3">
              <FontAwesome name="user" size={18} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-3 font-medium text-slate-800"
                placeholder="Your full name"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          {/* Create Profile Button */}
          <TouchableOpacity
            onPress={handleCreateProfile}
            disabled={loading}
            className={`bg-primary p-4 rounded-xl items-center ${
              loading ? "opacity-70" : ""
            }`}
          >
            {loading ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="#ffffff" size="small" />
                <Text className="text-white font-bold text-base ml-2">
                  Creating Profile...
                </Text>
              </View>
            ) : (
              <Text className="text-white font-bold text-base">
                Complete Profile →
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
