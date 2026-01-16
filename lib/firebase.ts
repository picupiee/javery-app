import { getApp } from "@react-native-firebase/app";
import _auth from "@react-native-firebase/auth";
import _firestore from "@react-native-firebase/firestore";
import _appCheck, {
  ReactNativeFirebaseAppCheckProvider,
  initializeAppCheck,
} from "@react-native-firebase/app-check";

/**
 * React Native Firebase Initialization
 *
 * Note: RNFB automatically initializes the default app using:
 * - Android: google-services.json
 * - iOS: GoogleService-Info.plist
 *
 * In Expo Managed workflow, this requires the @react-native-firebase/app
 * config plugin to be present in app.json.
 */

// Export auth and firestore instances
export const auth = _auth();
export const db = _firestore();

// Initialize AppCheck with React Native Firebase provider
const rnfbProvider = new ReactNativeFirebaseAppCheckProvider();
rnfbProvider.configure({
  android: {
    provider: __DEV__ ? "debug" : "playIntegrity",
    debugToken: "8550F0FE-4EF3-45B9-8411-C9A7041A8926",
  },
});

try {
  initializeAppCheck(getApp(), {
    provider: rnfbProvider,
    isTokenAutoRefreshEnabled: true,
  });
} catch (e) {
  // Catch already initialized error if any
  console.log("AppCheck initialization:", e);
}

export const FIREBASE_AUTH = auth;
export const FIRESTORE_DB = db;

// Export a default object for convenience
export default {
  auth: auth,
  db: db,
  appCheck: _appCheck,
  firestore: _firestore, // Static access for FieldValue, etc.
};
