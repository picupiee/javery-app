import { Alert, Platform } from "react-native";

/**
 * Show a simple alert dialog.
 */
export const showAlert = (title: string, message: string, onPress?: () => void) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    if (onPress) onPress();
  } else {
    Alert.alert(title, message, onPress ? [{ text: "OK", onPress }] : undefined);
  }
};

/**
 * Show a confirmation dialog with Yes/No options.
 */
export const showConfirm = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  confirmText: string = "Ya",
  cancelText: string = "Batal"
) => {
  if (Platform.OS === "web") {
    setTimeout(() => {
        const result = window.confirm(`${title}\n\n${message}`);
        if (result) {
        onConfirm();
        } else {
        if (onCancel) onCancel();
        }
    }, 100);
  } else {
    Alert.alert(
      title,
      message,
      [
        { text: cancelText, style: "cancel", onPress: onCancel },
        { text: confirmText, onPress: onConfirm },
      ],
      { cancelable: true }
    );
  }
};
