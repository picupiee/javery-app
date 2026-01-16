import { useAuth } from "@/context/AuthContext";
import firebase from "@/lib/firebase";
const { db } = firebase;
import { CartItem } from "@/types";
import { useEffect, useState } from "react";

const getCartRef = (userId: string) =>
  db.collection("users").doc(userId).collection("cart");

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
      await getCartRef(user.uid).doc(item.id).set(item);
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!user) return;
    try {
      await getCartRef(user.uid).doc(itemId).delete();
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!user) return;
    try {
      const itemRef = getCartRef(user.uid).doc(itemId);
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
    if (!user) return;
    const promises = cartItems.map((item) =>
      getCartRef(user.uid).doc(item.id).delete()
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
