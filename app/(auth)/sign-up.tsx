import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { createUser } from "@/lib/appwrite";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Text, View } from "react-native";

const SignUp = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const submit = async () => {
    const { name, email, password } = form;
    if (!name || !email || !password) {
      Alert.alert(
        "Error",
        "Mohon isi nama, email dan kata sandi yang sesuai !"
      );
      return;
    }
    setIsSubmitting(true);
    try {
      // AppWrite signup logic
      await createUser({ name, email, password });

      Alert.alert(
        "Akun Berhasil Dibuat",
        `Selamat Datang di Javery, ${name} !`
      );
      router.replace("/");
    } catch (error) {
      Alert.alert(
        "Gagal Membuat Akun",
        "Silahkan cek kembali email dan kata sandi anda."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="gap-10 bg-white rounded-lg p-5 mt-5">
      <CustomInput
        placeholder="Nama Lengkap"
        value={form.name}
        onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
        label="Nama Lengkap"
      />
      <CustomInput
        placeholder="Alamat Email"
        value={form.email}
        onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
        label="Email"
        keyboardType="email-address"
      />
      <CustomInput
        placeholder="Kata Sandi min. 8 karakter atau lebih"
        value={form.password}
        onChangeText={(text) =>
          setForm((prev) => ({ ...prev, password: text }))
        }
        label="Kata Sandi"
        keyboardType="default"
        secureTextEntry={true}
      />
      <CustomButton
        title="Daftar"
        isLoading={isSubmitting}
        onPress={submit}
        textStyle="text-white base-bold"
      />
      <View className="flex justify-center mt-5 flex-row gap-2">
        <Text className="base-regular text-gray-100">Sudah Terdaftar ?</Text>
        <Link href="/sign-in" className="base-bold text-primary">
          Masuk
        </Link>
      </View>
    </View>
  );
};

export default SignUp;
