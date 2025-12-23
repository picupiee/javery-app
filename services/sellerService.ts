import { db } from "@/lib/firebase";
import { SellerProfile } from "@/types";
import { collection, getDocs, limit, query, where } from "firebase/firestore";

export interface Seller extends SellerProfile {
  // Add any extra fields if needed
}

export const getActiveSellers = async (): Promise<Seller[]> => {
  try {
    const sellersRef = collection(db, "sellers");
    // Query for sellers where storeStatus.isOpen is true
    // Note: This requires an index on `storeStatus.isOpen` if we have many sellers
    const q = query(sellersRef, where("storeStatus.isOpen", "==", true));

    const snapshot = await getDocs(q);
    const sellers: Seller[] = [];

    snapshot.forEach((doc) => {
      sellers.push(doc.data() as Seller);
    });

    return sellers;
  } catch (error) {
    console.error("Error fetching active sellers:", error);
    return [];
  }
};

export const getAllSellers = async (): Promise<Seller[]> => {
  try {
    const sellersRef = collection(db, "sellers");
    const snapshot = await getDocs(sellersRef);
    const sellers: Seller[] = [];

    snapshot.forEach((doc) => {
      sellers.push(doc.data() as Seller);
    });

    return sellers;
  } catch (error) {
    console.error("Error fetching all sellers:", error);
    return [];
  }
};
const sellerCache: Record<string, Seller> = {};

export const getSellerProfile = async (uid: string): Promise<Seller | null> => {
  if (sellerCache[uid]) {
    return sellerCache[uid];
  }

  try {
    const sellersRef = collection(db, "sellers");
    const q = query(sellersRef, where("uid", "==", uid), limit(1));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const seller = snapshot.docs[0].data() as Seller;
      sellerCache[uid] = seller;
      return seller;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching seller profile for ${uid}:`, error);
    return null;
  }
};
