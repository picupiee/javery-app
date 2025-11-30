import { db } from "@/lib/firebase";
import { SellerProfile } from "@/types";
import { collection, getDocs, query, where } from "firebase/firestore";

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
