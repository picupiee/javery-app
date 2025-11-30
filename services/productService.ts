import { db } from "@/lib/firebase";
import { Product } from "@/types";
import { collection, doc, getDoc, getDocs, limit, orderBy, query, where } from "firebase/firestore";

export const getFeaturedProducts = async (): Promise<Product[]> => {
  try {
    const productsRef = collection(db, "products");
    // For now, just get the latest 10 products
    const q = query(productsRef, orderBy("createdAt", "desc"), limit(10));
    
    const snapshot = await getDocs(q);
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
    const productsRef = collection(db, "products");
    const q = query(productsRef, where("sellerUid", "==", sellerUid));
    
    const snapshot = await getDocs(q);
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
    const docRef = doc(db, "products", productId);
    const docSnap = await getDoc(docRef);
    
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
        
        const productsRef = collection(db, "products");
        const q = query(productsRef, limit(50)); // Limit to avoid fetching too much
        const snapshot = await getDocs(q);
        
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
