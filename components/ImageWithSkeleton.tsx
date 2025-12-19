import React, { useState } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Image, ImageProps } from "expo-image";
import Skeleton from "./Skeleton";

interface ImageWithSkeletonProps extends ImageProps {
  containerStyle?: ViewStyle;
  borderRadius?: number;
}

const ImageWithSkeleton: React.FC<ImageWithSkeletonProps> = ({
  containerStyle,
  style,
  borderRadius,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);

  // Extract border radius for the skeleton
  const flattenedStyle = StyleSheet.flatten(style as ViewStyle) || {};
  const computedBorderRadius = borderRadius ?? flattenedStyle.borderRadius ?? 0;

  return (
    <View style={[styles.container, containerStyle, style]}>
      {isLoading && (
        <Skeleton
          width="100%"
          height="100%"
          borderRadius={Number(computedBorderRadius)}
          style={styles.skeletonOverlay}
        />
      )}
      <Image
        {...props}
        style={[style, styles.image]}
        onLoadStart={() => setIsLoading(true)}
        onLoad={() => setIsLoading(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
  },
  skeletonOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  image: {
    // We don't hide the image, expo-image handles the transition
    // But we keep the skeleton on top until loaded
  },
});

export default ImageWithSkeleton;
