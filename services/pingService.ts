import firebase from "@/lib/firebase";
const { db } = firebase;
import { getSellerProfile } from "@/services/sellerService";
import { Ping } from "@/types";

const PING_VISIBILITY_MS = 1 * 60 * 1000; // 1 minute in milliseconds

/**
 * Subscribe to recent pings (created within last 1 minute)
 */
export const subscribeToRecentPings = (
  callback: (pings: Ping[]) => void,
  maxLimit: number = 10
) => {
  const cutoffTime = firebase.firestore.Timestamp.fromDate(
    new Date(Date.now() - PING_VISIBILITY_MS)
  );

  return db
    .collection("pings")
    .where("createdAt", ">", cutoffTime)
    .orderBy("createdAt", "desc")
    .limit(maxLimit)
    .onSnapshot(
      async (snapshot) => {
        const pings: Ping[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            sellerUid: data.sellerUid,
            storeName: data.storeName,
            message: data.message,
            createdAt: data.createdAt,
          };
        });

        // Fetch photos for each ping
        const pingsWithPhotos = await Promise.all(
          pings.map(async (ping) => {
            const seller = await getSellerProfile(ping.sellerUid);
            return {
              ...ping,
              photoURL: seller?.photoURL,
            };
          })
        );

        callback(pingsWithPhotos);
      },
      (error) => {
        console.error("Error subscribing to pings:", error);
        callback([]);
      }
    );
};

/**
 * Manually fetch recent pings (for refresh functionality)
 */
export const getRecentPings = async (
  maxLimit: number = 10
): Promise<Ping[]> => {
  try {
    const cutoffTime = firebase.firestore.Timestamp.fromDate(
      new Date(Date.now() - PING_VISIBILITY_MS)
    );

    const snapshot = await db
      .collection("pings")
      .where("createdAt", ">", cutoffTime)
      .orderBy("createdAt", "desc")
      .limit(maxLimit)
      .get();

    const pings = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        sellerUid: data.sellerUid,
        storeName: data.storeName,
        message: data.message,
        createdAt: data.createdAt,
      };
    });

    const pingsWithPhotos = await Promise.all(
      pings.map(async (ping) => {
        const seller = await getSellerProfile(ping.sellerUid);
        return {
          ...ping,
          photoURL: seller?.photoURL,
        };
      })
    );

    return pingsWithPhotos;
  } catch (error) {
    console.error("Error fetching pings:", error);
    return [];
  }
};

export const formatTimeAgo = (timestamp: any): string => {
  if (!timestamp || typeof timestamp.toDate !== "function") return "Just now";

  const date = timestamp.toDate();
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);

  if (diffSecs < 10) return "Just now";
  if (diffSecs < 60) return `${diffSecs} seconds ago`;

  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins === 1) return "1 minute ago";
  if (diffMins < 60) return `${diffMins} minutes ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return "1 hour ago";
  if (diffHours < 24) return `${diffHours} hours ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
};
