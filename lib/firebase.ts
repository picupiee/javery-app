// New Firebase Config
import firebase from "@react-native-firebase/app";
import authModule from "@react-native-firebase/auth";
import firestoreModule from "@react-native-firebase/firestore";
import appCheck, { initializeAppCheck } from "@react-native-firebase/app-check";

// Use the namespaced factory method to bypass 'unknown' type errors
const appCheckModule = appCheck();

// 1. Create the provider using the factory method
const provider = appCheckModule.newReactNativeFirebaseAppCheckProvider();

provider.configure({
  android: {
    provider: __DEV__ ? 'debug' : 'playIntegrity',
    debugToken: 'YOUR_DEBUG_TOKEN', 
  },
  apple: {
    provider: __DEV__ ? 'debug' : 'appAttestWithDeviceCheckFallback',
    debugToken: 'YOUR_DEBUG_TOKEN',
  }
});

// 2. Initialize App Check
// Use (firebase.app() as any) to bypass the 'FirebaseApp' assignment error
// This is necessary because the SDK types currently fail to recognize the native app instance correctly
initializeAppCheck(firebase.app() as any, {
  provider: provider,
  isTokenAutoRefreshEnabled: true,
});

// 3. Export Native Instances
export const auth = authModule();
export const db = firestoreModule();

export default auth;

