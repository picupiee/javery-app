import * as Updates from "expo-updates";
import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";

/**
 * Returns true if the app is running in a standalone/deployed environment
 * that supports OTA updates (i.e., not local Expo Go/Development Client).
 */
export const isUpdateEnabledBuild = () => {
  if (Platform.OS === "web") return false;
  // The updateId is null in development/Expo Go, but a UUID in deployed builds.
  return Updates.updateId !== null;
};

const useUpdates = () => {
  // We only need a simple boolean to inform the UI
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  // We keep updateStatus for the Account page to track the manual process
  const [updateStatus, setUpdateStatus] = useState<
    "checking" | "downloading" | "ready" | "error" | "idle"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  // 1. Passive Check: Only checks, sets a boolean, and DOES NOT download or prompt
  const passiveCheckForUpdates = async () => {
    if (!isUpdateEnabledBuild()) {
      console.log("Updates skipped: Not a deployed build.");
      return;
    }
    if (!Updates.isEnabled) return;
    try {
      const update = await Updates.checkForUpdateAsync();
      setIsUpdateAvailable(update.isAvailable); // Set the flag
    } catch (e) {
      // Log error but don't notify the user with a popup on the main screen
      console.error("Passive update check failed:", e);
    }
  };

  // 2. Active Check: Used on the Account page (kept from before)
  const activeCheckAndApplyUpdate = async () => {
    if (Platform.OS === "web") {
      window.location.reload();
      return;
    }
    if (!Updates.isEnabled) return;
    setUpdateStatus("checking");
    setError(null);

    try {
      const updateCheckResult = await Updates.checkForUpdateAsync();

      if (updateCheckResult.isAvailable) {
        setUpdateStatus("downloading");
        await Updates.fetchUpdateAsync(); // Downloads the update

        setUpdateStatus("ready");

        // Prompt user ONLY after successful download
        Alert.alert(
          "Update Ready",
          "Update has been downloaded. Reload now to install?",
          [
            { text: "Reload", onPress: () => Updates.reloadAsync() },
            { text: "Later", style: "cancel" },
          ]
        );
      } else {
        setUpdateStatus("idle");
        // This case is handled in the Account screen's handler (e.g., show a toast)
      }
    } catch (e: any) {
      setError("Failed to check/download update. Check connection.");
      setUpdateStatus("error");
    }
  };

  useEffect(() => {
    passiveCheckForUpdates(); // Run the passive check on mount
  }, []);

  return {
    isUpdateAvailable,
    updateStatus,
    error,
    activeCheckAndApplyUpdate, // Return the active function for the Account page
  };
};

export default useUpdates;
