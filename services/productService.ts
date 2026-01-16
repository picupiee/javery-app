import firebase from "@/lib/firebase";
const { db } = firebase;
import { Product } from "@/types";

export const getFeaturedProducts = async (
  limitCount: number = 10
): Promise<Product[]> => {
  try {
    const snapshot = await db
      .collection("products")
      .orderBy("createdAt", "desc")
      .limit(limitCount)
      .get();

    const products: Product[] = [];
    snapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product);
    });

    return products;
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
};

export const getProductsBySeller = async (
  sellerUid: string
): Promise<Product[]> => {
  try {
    const snapshot = await db
      .collection("products")
      .where("sellerUid", "==", sellerUid)
      .get();

    const products: Product[] = [];
    snapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product);
    });

    return products;
  } catch (error) {
    console.error(`Error fetching products for seller ${sellerUid}:`, error);
    return [];
  }
};

export const getProductById = async (
  productId: string
): Promise<Product | null> => {
  console.log(`[productService] Fetching product with ID: ${productId}`);
  try {
    const docSnap = await db.collection("products").doc(productId).get();
    const data = docSnap.data();
    console.log(
      `[productService] Document data:`,
      data ? "Data exists" : "No data",
      `exists property: ${docSnap.exists}`
    );

    if (data) {
      const product = { id: docSnap.id, ...data } as Product;
      console.log(`[productService] Product found: ${product.name}`);
      return product;
    } else {
      console.log(`[productService] Product not found for ID: ${productId}`);
      return null;
    }
  } catch (error) {
    console.error(
      `[productService] Error fetching product ${productId}:`,
      error
    );
    return null;
  }
};

export const searchProducts = async (
  searchTerm: string
): Promise<Product[]> => {
  try {
    const snapshot = await db.collection("products").limit(50).get();

    const products: Product[] = [];
    const lowerTerm = searchTerm.toLowerCase();

    snapshot.forEach((doc) => {
      const data = doc.data() as Product;
      if (data.name.toLowerCase().includes(lowerTerm)) {
        products.push({ ...data, id: doc.id });
      }
    });

    return products;
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
};
