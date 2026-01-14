import { showAlert } from "@/lib/alert";
import useUpdates from "@/hooks/useUpdate";
import { auth } from "@/lib/firebase";
import { FontAwesome } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VerifyEmail() {
    const [loading, setLoading] = useState(false);

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
            <KeyboardAvoidingView behavior="padding" className="flex-1">
                <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
                    <View className="flex-1 justify-center px-6 py-8">
                        {/* Header */}
                        <View className="items-center mb-10">
                            <View className="w-20 h-20 bg-orange-100 rounded-full items-center justify-center mb-4">
                                <Text className="text-4xl">🍊</Text>
                            </View>
                            <Text className="text-3xl font-bold text-primary mb-2">
                                Javery
                            </Text>
                            <Text className="text-slate-500 font-medium text-center">
                                Japri Ahlinya !
                            </Text>
                        </View>

                        {/* Welcome Text */}
                        <View className="mb-8">
                            <Text className="text-2xl font-bold text-slate-800 mb-2">
                                Silahkan verfikasi email anda terlebih dahulu.
                            </Text>
                            <Text className="text-slate-600 font-medium">
                                Cek kotak masuk anda sekarang.
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
