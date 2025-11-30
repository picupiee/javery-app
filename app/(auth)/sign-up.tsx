import { auth, db } from "@/lib/firebase";
import { UserProfile } from "@/types";
import { Link } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 2. Update Display Name
      await updateProfile(user, { displayName: name });

      // 3. Create Firestore Profile
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: name,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", user.uid), userProfile);

      // Router replace is handled in _layout.tsx
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white justify-center px-6">
      <View className="items-center mb-10">
        <Text className="text-3xl font-bold text-primary mb-2 font-quicksand-bold">
          Create Account
        </Text>
        <Text className="text-gray-500 font-quicksand-medium">
          Sign up to start shopping
        </Text>
      </View>

      <View className="space-y-4">
        <View>
          <Text className="text-gray-700 mb-2 font-quicksand-medium">
            Full Name
          </Text>
          <TextInput
            className="w-full bg-gray-100 p-4 rounded-xl font-quicksand-medium"
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View>
          <Text className="text-gray-700 mb-2 font-quicksand-medium">
            Email
          </Text>
          <TextInput
            className="w-full bg-gray-100 p-4 rounded-xl font-quicksand-medium"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View>
          <Text className="text-gray-700 mb-2 font-quicksand-medium">
            Password
          </Text>
          <TextInput
            className="w-full bg-gray-100 p-4 rounded-xl font-quicksand-medium"
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          onPress={handleSignUp}
          disabled={loading}
          className={`w-full bg-black p-4 rounded-xl items-center ${
            loading ? "opacity-70" : ""
          }`}
        >
          <Text className="text-white font-bold text-lg font-quicksand-bold">
            {loading ? "Creating Account..." : "Sign Up"}
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-4">
          <Text className="text-gray-500 font-quicksand-medium">
            Already have an account?{" "}
          </Text>
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity>
              <Text className="text-primary font-bold font-quicksand-bold">
                Sign In
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
