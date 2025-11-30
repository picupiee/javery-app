import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { auth } from "@/lib/firebase";
import useAuthStore from "@/store/auth.store";
import { Link, router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Alert, Text, View } from "react-native";

const SignIn = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const { fetchAuthenticatedUser } = useAuthStore();

  const submit = async () => {
    const { email, password } = form;
    if (!email || !password) {
      Alert.alert("Error", "Mohon isi email dan kata sandi yang tepat !");
      return;
    }
    setIsSubmitting(true);
    try {
      // Firebase signin logic
      await signInWithEmailAndPassword(auth, email, password);
      await fetchAuthenticatedUser();
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Error", `Gagal masuk. : ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="gap-10 bg-white rounded-lg p-5 mt-5">
      <CustomInput
        placeholder="Alamat Email"
        value={form.email}
        onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
        label="Email"
        keyboardType="email-address"
      />
      <CustomInput
        placeholder="Masukkan Kata Sandi"
        value={form.password}
        onChangeText={(text) =>
          setForm((prev) => ({ ...prev, password: text }))
        }
        label="Password"
        keyboardType="default"
        secureTextEntry={true}
      />
      <CustomButton
        title="Masuk"
        isLoading={isSubmitting}
        onPress={submit}
        textStyle="text-white base-bold"
      />
      <View className="flex justify-center mt-5 flex-row gap-2">
        <Text className="base-regular text-gray-100">Belum terdaftar ?</Text>
        <Link href="/sign-up" className="base-bold text-primary">
          Daftar
        </Link>
      </View>
    </View>
  );
};

export default SignIn;
