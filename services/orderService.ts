import { db } from "@/lib/firebase";
import { Address, CartItem, Order } from "@/types";
import {
    addDoc,
    collection,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    where,
    writeBatch,
} from "firebase/firestore";

export const createOrder = async (
  buyerUid: string,
  buyerName: string,
  sellerUid: string,
  sellerName: string,
  items: CartItem[],
  totalAmount: number,
  shippingAddress: Address,
  buyerLocation?: { latitude: number; longitude: number } | null,
  pickupOrder?: boolean,
) => {
  try {
    const ordersRef = collection(db, "orders");
    const orderData = {
      buyerUid,
      buyerName,
      sellerUid,
      sellerName,
      items,
      totalAmount,
      status: "waiting",
      shippingAddress,
      buyerLocation: buyerLocation || null,
      paymentMethod: "cod",
      createdAt: serverTimestamp(),
      pickupOrder: pickupOrder || false,
      // We should probably include sellerPhoneNumber if we want it in the order snapshot
      // skipping for now unless we fetch it separately or pass it in items.
    };

    const docRef = await addDoc(ordersRef, orderData);

    // Remove items from Cart (batch)
    const batch = writeBatch(db);
    items.forEach((item) => {
      const itemRef = doc(db, "users", buyerUid, "cart", item.id);
      batch.delete(itemRef);
    });
    await batch.commit();

    // Notification is now handled by Cloud Functions (backend)
    // to avoid CORS issues on Web and unify logic.

    return docRef.id;
  } catch (error) {
    console.error("Error creating order:", error);
    throw new Error("Gagal membuat pesanan.");
  }
};

export const getMyOrders = async (buyerUid: string): Promise<Order[]> => {
  try {
    const q = query(
      collection(db, "orders"),
      where("buyerUid", "==", buyerUid),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new Error("Gagal memuat pesanan.");
  }
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const docRef = doc(db, "orders", orderId);
    const snapshot = await import("firebase/firestore").then((mod) =>
      mod.getDoc(docRef)
    );
    if (snapshot.exists()) {
      const order = { id: snapshot.id, ...snapshot.data() } as Order;
      // Lazy Update Check
      if (order.status === "delivering" && order.deliveryStartTime) {
        const startTime = order.deliveryStartTime.toDate().getTime();
        const now = Date.now();
        const thirtyMinutes = 30 * 60 * 1000;

        if (now - startTime > thirtyMinutes) {
          // Auto-complete
          await import("firebase/firestore").then((mod) =>
            mod.updateDoc(docRef, {
              status: "completed",
              completedAt: mod.serverTimestamp(),
            })
          );
          return { ...order, status: "completed" }; // Return updated state locally
        }
      }
      return order;
    }
    return null;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw new Error("Gagal memuat detail pesanan.");
  }
};
