import { db } from "@/lib/firebase";
import { Product } from "@/types";

/**
 * Fetches all products from Firestore
 * @param limitCount Optional limit on number of products to fetch
 * @returns Array of products
 */
export const getAllProducts = async (
  limitCount?: number
): Promise<Product[]> => {
  try {
    let query = db.collection("products").orderBy("createdAt", "desc");

    if (limitCount) {
      query = query.limit(limitCount);
    }

    const snapshot = await query.get();
    const products: Product[] = [];

    snapshot.forEach((doc) => {
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
    const snapshot = await db
      .collection("products")
      .where("sellerUid", "==", sellerUid)
      .orderBy("createdAt", "desc")
      .get();

    const products: Product[] = [];

    snapshot.forEach((doc) => {
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
