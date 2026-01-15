import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { CartItem } from "@/types";
import { useEffect, useState } from "react";

const getCartRef = (userId: string) => db.collection("users").doc(userId).collection("cart");

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

    const unsubscribe = getCartRef(user.uid).onSnapshot(
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
      const itemRef = db.collection("users").doc(user.uid).collection("cart").doc(item.id);
      
      // If item exists, update quantity could be handled here or in UI.
      // For now, we overwrite or expect UI to handle 'update'.
      // But typically "Add to Cart" implies +1 or Set.
      // Let's assume we overwrite/set for simplicity OR check existence.
      // Using setDoc with merge: true handles both creation and update of fields if needed.
      
      await itemRef.set(item);
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!user) return;
    try {
      const itemRef = db.collection("users").doc(user.uid).collection("cart").doc(itemId);
      await itemRef.delete();
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!user) return;
    try {
      const itemRef = db.collection("users").doc(user.uid).collection("cart").doc(itemId);
      if (quantity <= 0) {
        await itemRef.delete();
      } else {
        await itemRef.update({ quantity });
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
      db.collection("users").doc(user.uid).collection("cart").doc(item.id).delete()
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
