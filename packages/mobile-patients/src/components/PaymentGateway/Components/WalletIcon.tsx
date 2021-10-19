import React, { useEffect, useState } from 'react';
import { StyleSheet, Image } from 'react-native';

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
        setAspectRatio(height / width);
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
        height: 35,
      }}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    width: 35,
  },
});
