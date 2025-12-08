import { db } from "@/lib/firebase";
import { Address } from "@/types";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    updateDoc
} from "firebase/firestore";

const getCollection = (userId: string) =>
  collection(db, "users", userId, "addresses");

export const addAddress = async (
  userId: string,
  address: Omit<Address, "id">
): Promise<string> => {
  try {
    const colRef = getCollection(userId);
    
    // If set as default, unset others first
    if (address.isDefault) {
      const allDocs = await getDocs(colRef);
      const batchPromises = allDocs.docs.map((d) =>
        updateDoc(d.ref, { isDefault: false })
      );
      await Promise.all(batchPromises);
    }

    const docRef = await addDoc(colRef, address);
    return docRef.id;
  } catch (error) {
    console.error("Error adding address:", error);
    throw new Error("Gagal menyimpan alamat.");
  }
};

export const getAddresses = async (userId: string): Promise<Address[]> => {
  try {
    const colRef = getCollection(userId);
    const snapshot = await getDocs(colRef);
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
    const docRef = doc(db, "users", userId, "addresses", addressId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting address:", error);
    throw new Error("Gagal menghapus alamat.");
  }
};
