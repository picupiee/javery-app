const {
  onDocumentCreated,
  onDocumentUpdated,
} = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const { Expo } = require("expo-server-sdk");

admin.initializeApp();

// Set region if necessary, default is us-central1
setGlobalOptions({ region: "us-central1" });

const expo = new Expo();

exports.sendOrderNotification = onDocumentCreated(
  "orders/{orderId}",
  async (event) => {
    const snap = event.data;
    if (!snap) {
      console.log("No data associated with the event");
      return;
    }
    const orderData = snap.data();
    const sellerUid = orderData.sellerUid;
    const buyerName = orderData.buyerName;
    const totalAmount = orderData.totalAmount;

    if (!sellerUid) {
      console.log("No sellerUid in order");
      return;
    }

    try {
      const sellerDoc = await admin
        .firestore()
        .collection("users")
        .doc(sellerUid)
        .get();
      if (!sellerDoc.exists) {
        console.log("Seller not found");
        return;
      }

      const sellerData = sellerDoc.data();
      const pushToken = sellerData.expoPushToken;

      if (!pushToken || !Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`);
        return;
      }

      const messages = [
        {
          to: pushToken,
          sound: "default",
          title: "New Order Received!",
          body: `You have a new order from ${buyerName} for Rp ${totalAmount.toLocaleString()}`,
          data: { orderId: event.params.orderId },
        },
      ];

      let chunks = expo.chunkPushNotifications(messages);
      for (let chunk of chunks) {
        try {
          let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          console.log(ticketChunk);
        } catch (error) {
          console.error(error);
        }
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  }
);

exports.sendOrderStatusNotification = onDocumentUpdated(
  "orders/{orderId}",
  async (event) => {
    const change = event.data;
    const newData = change.after.data();
    const oldData = change.before.data();

    // Only send notification if status changes
    if (newData.status === oldData.status) {
      return;
    }

    const buyerUid = newData.buyerUid;
    const newStatus = newData.status;

    if (!buyerUid) {
      console.log("No buyerUid in order");
      return;
    }

    let title = "Order Status Update";
    let body = `Your order status has been updated to ${newStatus}`;

    // Customize message based on status
    switch (newStatus) {
      case "processing":
        title = "Pesanan Diproses";
        body = "Penjual sedang menyiapkan pesanan Anda.";
        break;
      case "delivering":
        title = "Pesanan Diantar";
        body = "Pesanan Anda sedang dalam perjalanan.";
        break;
      case "completed":
        title = "Pesanan Selesai";
        body = "Pesanan telah sampai. Selamat menikmati!";
        break;
      case "cancelled":
        title = "Pesanan Dibatalkan";
        body = "Pesanan Anda telah dibatalkan oleh penjual.";
        break;
    }

    try {
      const buyerDoc = await admin
        .firestore()
        .collection("users")
        .doc(buyerUid)
        .get();

      if (!buyerDoc.exists) {
        console.log("Buyer not found");
        return;
      }

      const buyerData = buyerDoc.data();
      const pushToken = buyerData.expoPushToken;

      if (!pushToken || !Expo.isExpoPushToken(pushToken)) {
        console.log(`Buyer ${buyerUid} has no valid push token`);
        return;
      }

      const messages = [
        {
          to: pushToken,
          sound: "default",
          title: title,
          body: body,
          data: { orderId: event.params.orderId },
        },
      ];

      let chunks = expo.chunkPushNotifications(messages);
      for (let chunk of chunks) {
        try {
          await expo.sendPushNotificationsAsync(chunk);
        } catch (error) {
          console.error("Error sending chunk:", error);
        }
      }
    } catch (error) {
      console.error("Error in sendOrderStatusNotification:", error);
    }
  }
);
