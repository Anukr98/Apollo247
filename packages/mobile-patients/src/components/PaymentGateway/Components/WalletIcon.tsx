import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList } from 'react-native';

export interface WalletIconProps {
  imageUrl: string;
}

export const WalletIcon: React.FC<WalletIconProps> = (props) => {
  const { imageUrl } = props;
  const [aspectRatio, setAspectRatio] = useState<number>(0);

  useEffect(() => {
    Image.getSize(
      imageUrl,
      (width, height) => {
        setAspectRatio(width / height);
      },
      () => {}
    );
  });

  return (
    <Image
      source={{ uri: imageUrl }}
      resizeMode="contain"
      style={{
        ...styles.image,
        width: aspectRatio ? 27 * aspectRatio : 0,
      }}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    height: 27,
  },
});
