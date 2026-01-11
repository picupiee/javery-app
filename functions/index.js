const {
  onDocumentCreated,
  onDocumentUpdated,
  onDocumentDeleted,
} = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const { Expo } = require("expo-server-sdk");
const cloudinary = require("cloudinary").v2;

admin.initializeApp();

// Cloudinary configuration
cloudinary.config({
  cloud_name: "dazl8oipc",
  api_key: "636879112138795",
  api_secret: "NYSCksSlorzkDb9X8zQxwIVWwAA",
});

// Set region if necessary, default is us-central1
setGlobalOptions({ region: "us-central1" });

const expo = new Expo();

/**
 * Helper to extract Cloudinary Public ID from a URL
 * Handles versioning (v123...) and folder structures.
 */
const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes("cloudinary.com")) return null;

  // Regex: Finds everything between '/upload/' (optionally skipping /v123/) and the file extension
  const regex = /\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/;
  const match = url.match(regex);

  return match ? match[1] : null;
};

/**
 * Helper to delete image from Cloudinary
 */
const deleteCloudinaryImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
    });
    console.log(`Cloudinary deletion for [${publicId}]:`, result.result);
    return result;
  } catch (error) {
    console.error(`Cloudinary error for [${publicId}]:`, error);
    throw error;
  }
};

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
      const pushToken = sellerData.sellerPushToken;

      if (!pushToken || !Expo.isExpoPushToken(pushToken)) {
        console.error(
          `Seller ${sellerUid} has no valid sellerPushToken (token: ${pushToken})`
        );
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
          console.log("Notification sent successfully");
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
      const pushToken = buyerData.buyerPushToken;

      if (!pushToken || !Expo.isExpoPushToken(pushToken)) {
        console.log(
          `Buyer ${buyerUid.charAt(5).trim() + "..."} has no valid buyerPushToken (token: ${pushToken.charAt(5).trim() + "..."})`
        );
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

exports.deleteProductImage = onDocumentDeleted(
  "products/{productId}",
  async (event) => {
    const data = event.data?.data();
    const publicId = getPublicIdFromUrl(data?.imageUrl);

    if (publicId) {
      await deleteCloudinaryImage(publicId);
    }
  }
);

exports.cleanupOldProductImage = onDocumentUpdated(
  "products/{productId}",
  async (event) => {
    const beforeData = event.data.before.data();
    const afterData = event.data.after.data();

    const oldUrl = beforeData.imageUrl;
    const newUrl = afterData.imageUrl;

    // Only delete if the URL has changed and the old one existed
    if (oldUrl && oldUrl !== newUrl) {
      const publicId = getPublicIdFromUrl(oldUrl);
      if (publicId) {
        console.log("Detected image change, removing old asset...");
        await deleteCloudinaryImage(publicId);
      }
    }
  }
);
