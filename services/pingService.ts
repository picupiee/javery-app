import { db } from "@/lib/firebase";
import { Ping } from "@/types";
import {
    collection,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    Timestamp,
    where,
} from "firebase/firestore";

const PING_VISIBILITY_MS = 1 * 60 * 1000; // 1 minute in milliseconds

/**
 * Subscribe to recent pings (created within last 1 minute)
 * @param callback Function to call with updated pings
 * @param maxLimit Maximum number of pings to fetch
 * @returns Unsubscribe function
 */
export const subscribeToRecentPings = (
  callback: (pings: Ping[]) => void,
  maxLimit: number = 10
) => {
  // Calculate cutoff time (1 minute ago)
  const cutoffTime = Timestamp.fromDate(
    new Date(Date.now() - PING_VISIBILITY_MS)
  );

  const pingsQuery = query(
    collection(db, "pings"),
    where("createdAt", ">", cutoffTime),
    orderBy("createdAt", "desc"),
    limit(maxLimit)
  );

  const unsubscribe = onSnapshot(
    pingsQuery,
    (snapshot) => {
      const pings: Ping[] = snapshot.docs.map((doc) => ({
        sellerUid: doc.data().sellerUid,
        storeName: doc.data().storeName,
        message: doc.data().message,
        createdAt: doc.data().createdAt,
      }));
      callback(pings);
    },
    (error) => {
      console.error("Error subscribing to pings:", error);
      callback([]);
    }
  );

  return unsubscribe;
};

/**
 * Manually fetch recent pings (for refresh functionality)
 * @param maxLimit Maximum number of pings to fetch
 * @returns Array of recent pings
 */
export const getRecentPings = async (
  maxLimit: number = 10
): Promise<Ping[]> => {
  try {
    const cutoffTime = Timestamp.fromDate(
      new Date(Date.now() - PING_VISIBILITY_MS)
    );

    const pingsQuery = query(
      collection(db, "pings"),
      where("createdAt", ">", cutoffTime),
      orderBy("createdAt", "desc"),
      limit(maxLimit)
    );

    const snapshot = await getDocs(pingsQuery);
    return snapshot.docs.map((doc) => ({
      sellerUid: doc.data().sellerUid,
      storeName: doc.data().storeName,
      message: doc.data().message,
      createdAt: doc.data().createdAt,
    }));
  } catch (error) {
    console.error("Error fetching pings:", error);
    return [];
  }
};

/**
 * Format timestamp to human-readable "time ago" string
 * @param timestamp Firestore Timestamp
 * @returns Formatted string (e.g., "2 minutes ago")
 */
export const formatTimeAgo = (timestamp: any): string => {
  if (!timestamp || !timestamp.toDate) return "Just now";

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
