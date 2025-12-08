import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { CartItem } from "@/types";
import {
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    setDoc,
    updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";

const getCartRef = (userId: string) => collection(db, "users", userId, "cart");

export const useCart = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      getCartRef(user.uid),
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as CartItem[];
        setCartItems(items);
        setLoading(false);
      },
      (error) => {
        console.error("Cart listener error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addToCart = async (item: CartItem) => {
    if (!user) return;
    try {
      const itemRef = doc(db, "users", user.uid, "cart", item.id);
      
      // If item exists, update quantity could be handled here or in UI.
      // For now, we overwrite or expect UI to handle 'update'.
      // But typically "Add to Cart" implies +1 or Set.
      // Let's assume we overwrite/set for simplicity OR check existence.
      // Using setDoc with merge: true handles both creation and update of fields if needed.
      
      await setDoc(itemRef, item);
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!user) return;
    try {
      const itemRef = doc(db, "users", user.uid, "cart", itemId);
      await deleteDoc(itemRef);
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!user) return;
    try {
      const itemRef = doc(db, "users", user.uid, "cart", itemId);
      if (quantity <= 0) {
        await deleteDoc(itemRef);
      } else {
        await updateDoc(itemRef, { quantity });
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      throw error;
    }
  };

  const clearCart = async () => {
    // Note: Deleting a collection is not standard in Client SDK.
    // We must delete documents one by one.
    if (!user) return;
    const promises = cartItems.map((item) =>
      deleteDoc(doc(db, "users", user.uid, "cart", item.id))
    );
    await Promise.all(promises);
  };

  return {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };
};
