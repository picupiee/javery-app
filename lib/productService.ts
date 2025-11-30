import { db } from "@/lib/firebase";
import { Product } from "@/type";
import {
    collection,
    getDocs,
    limit,
    orderBy,
    query,
    where,
} from "firebase/firestore";

/**
 * Fetches all products from Firestore
 * @param limitCount Optional limit on number of products to fetch
 * @returns Array of products with seller names included
 */
export const getAllProducts = async (
  limitCount?: number
): Promise<Product[]> => {
  try {
    const productsRef = collection(db, "products");
    let q = query(productsRef, orderBy("createdAt", "desc"));
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const querySnapshot = await getDocs(q);
    const products: Product[] = [];
    
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      } as Product);
    });
    
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Gagal mengambil daftar produk.");
  }
};

/**
 * Fetches products from a specific seller
 * @param sellerUid The seller's UID
 * @returns Array of products from that seller
 */
export const getProductsBySeller = async (
  sellerUid: string
): Promise<Product[]> => {
  try {
    const productsRef = collection(db, "products");
    const q = query(
      productsRef,
      where("ownerUid", "==", sellerUid),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const products: Product[] = [];
    
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      } as Product);
    });
    
    return products;
  } catch (error) {
    console.error("Error fetching seller products:", error);
    throw new Error("Gagal mengambil produk dari toko ini.");
  }
};
