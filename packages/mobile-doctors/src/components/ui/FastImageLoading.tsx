import { Spinner } from '@aph/mobile-doctors/src/components/ui/Spinner';
import { string } from '@aph/mobile-doctors/src/strings/string';
import React, { useState } from 'react';
import { ImageStyle, StyleProp } from 'react-native';
import FastImage from 'react-native-fast-image';

export interface FastImageLoadingProps {
  uri: string;
  imageStyle: StyleProp<ImageStyle>;
  resizeMode: 'center' | 'stretch' | 'contain' | 'cover' | undefined;
  loader?: React.ReactNode;
}

export const FastImageLoading: React.FC<FastImageLoadingProps> = (props) => {
  const { uri, imageStyle, resizeMode, loader } = props;
  const [showLoading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  return (
    <FastImage
      source={{ uri: uri }}
      style={imageStyle}
      resizeMode={resizeMode}
      onLoadStart={() => {
        setLoading(true);
      }}
      onLoadEnd={() => {
        setLoading(false);
      }}
      onProgress={(progressEvent) =>
        setProgress((progressEvent.nativeEvent.loaded / progressEvent.nativeEvent.total) * 100)
      }
    >
      {showLoading ? (
        loader ? (
          loader
        ) : (
          <Spinner
            style={{ backgroundColor: 'transparent' }}
            size={'small'}
            message={`${string.common.imageLoading}: ${progress}%`}
          />
        )
      ) : null}
    </FastImage>
  );
};
