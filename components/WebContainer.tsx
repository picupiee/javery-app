import React from "react";
import { Platform, StyleSheet, View } from "react-native";

interface WebContainerProps {
  children: React.ReactNode;
}

export const WebContainer: React.FC<WebContainerProps> = ({ children }) => {
  if (Platform.OS !== "web") {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6", // Light gray background for the "outer" area
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100%", // Ensure it takes full height
  },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 480, // Mobile-like width
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden", // Clip content to the container
    minHeight: "100%", // Ensure content takes full height of the container
  },
});
