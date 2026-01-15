import { db } from "@/lib/firebase";
import { Product } from "@/types";

export const getFeaturedProducts = async (limitCount: number = 10): Promise<Product[]> => {
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

export const getProductsBySeller = async (sellerUid: string): Promise<Product[]> => {
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

export const getProductById = async (productId: string): Promise<Product | null> => {
  try {
    const docSnap = await db.collection("products").doc(productId).get();
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    return null;
  }
};

export const searchProducts = async (searchTerm: string): Promise<Product[]> => {
    try {
        // Firestore doesn't support native full-text search. 
        // We'll implement a basic client-side filter or a simple "startWith" query if applicable.
        // For a real app, use Algolia or Typesense.
        // Here we'll fetch all (or a subset) and filter in memory for simplicity in this stage.
        
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
}
