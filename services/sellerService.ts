import firebase from "@/lib/firebase";
const { db } = firebase;
import { SellerProfile } from "@/types";

export interface Seller extends SellerProfile {
  // Add any extra fields if needed
}

export const getActiveSellers = async (): Promise<Seller[]> => {
  try {
    const snapshot = await db
      .collection("sellers")
      .where("storeStatus.isOpen", "==", true)
      .get();

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

export const isSellerActive = async (uid: string): Promise<boolean> => {
  try {
    const snapshot = await db
      .collection("sellers")
      .where("uid", "==", uid)
      .where("storeStatus.isOpen", "==", true)
      .get();

    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking seller activity:", error);
    return false;
  }
};

export const subscribeToActiveSellers = (
  callback: (sellers: Seller[]) => void
) => {
  return db
    .collection("sellers")
    .where("storeStatus.isOpen", "==", true)
    .onSnapshot(
      (snapshot) => {
        const sellers: Seller[] = [];
        snapshot.forEach((doc) => {
          sellers.push(doc.data() as Seller);
        });
        callback(sellers);
      },
      (error) => {
        console.error("Error subscribing to active sellers:", error);
      }
    );
};

export const getAllSellers = async (): Promise<Seller[]> => {
  try {
    const snapshot = await db.collection("sellers").get();
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
    const snapshot = await db
      .collection("sellers")
      .where("uid", "==", uid)
      .limit(1)
      .get();

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
