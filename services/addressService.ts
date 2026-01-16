import firebase from "@/lib/firebase";
const { db } = firebase;
import { Address } from "@/types";

const getCollection = (userId: string) =>
  db.collection("users").doc(userId).collection("addresses");

export const addAddress = async (
  userId: string,
  address: Omit<Address, "id">
): Promise<string> => {
  try {
    console.log(`[addressService] Adding address for user: ${userId}`);
    const colRef = getCollection(userId);

    // If set as default, unset others first
    if (address.isDefault) {
      const allDocs = await colRef.get();
      const batchPromises = allDocs.docs.map((d) =>
        d.ref.update({ isDefault: false })
      );
      await Promise.all(batchPromises);
    }

    const docRef = await colRef.add(address);
    return docRef.id;
  } catch (error) {
    console.error("Error adding address:", error);
    throw new Error("Gagal menyimpan alamat.");
  }
};

export const getAddresses = async (userId: string): Promise<Address[]> => {
  if (!userId) {
    console.warn("[addressService] getAddresses called with empty userId");
    return [];
  }
  try {
    console.log(`[addressService] Fetching addresses for user: ${userId}`);
    const colRef = getCollection(userId);
    const snapshot = await colRef.get();
    console.log(`[addressService] Found ${snapshot.size} addresses`);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Address[];
  } catch (error) {
    console.error("Error fetching addresses:", error);
    throw new Error("Gagal memuat alamat.");
  }
};

export const deleteAddress = async (
  userId: string,
  addressId: string
): Promise<void> => {
  try {
    await db
      .collection("users")
      .doc(userId)
      .collection("addresses")
      .doc(addressId)
      .delete();
  } catch (error) {
    console.error("Error deleting address:", error);
    throw new Error("Gagal menghapus alamat.");
  }
};
