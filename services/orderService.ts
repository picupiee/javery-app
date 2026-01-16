import firebase from "@/lib/firebase";
const { db } = firebase;
import { Address, CartItem, Order } from "@/types";

export const createOrder = async (
  buyerUid: string,
  buyerName: string,
  sellerUid: string,
  sellerName: string,
  items: CartItem[],
  totalAmount: number,
  shippingAddress: Address,
  buyerLocation?: { latitude: number; longitude: number } | null,
  pickupOrder?: boolean
) => {
  try {
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
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      pickupOrder: pickupOrder || false,
    };

    const docRef = await db.collection("orders").add(orderData);

    // Remove items from Cart (batch)
    const batch = db.batch();
    items.forEach((item) => {
      const itemRef = db
        .collection("users")
        .doc(buyerUid)
        .collection("cart")
        .doc(item.id);
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
    const snapshot = await db
      .collection("orders")
      .where("buyerUid", "==", buyerUid)
      .orderBy("createdAt", "desc")
      .get();

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
    const docRef = db.collection("orders").doc(orderId);
    const snapshot = await docRef.get();
    const data = snapshot.data();

    if (data) {
      const order = { id: snapshot.id, ...data } as Order;
      // Lazy Update Check
      if (order.status === "delivering" && order.deliveryStartTime) {
        const startTime = (order.deliveryStartTime as any).toDate().getTime();
        const now = Date.now();
        const thirtyMinutes = 30 * 60 * 1000;

        if (now - startTime > thirtyMinutes) {
          // Auto-complete
          await docRef.update({
            status: "completed",
            completedAt: firebase.firestore.FieldValue.serverTimestamp(),
          });
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
