import React from 'react';
import { Image, ImageProps } from 'react-native';

export const SplashLogo: React.FC<Partial<ImageProps>> = (props) => (
  <Image
    style={{ width: 136.3, height: 100 }}
    {...props}
    source={require('app/src/images/apollo/ic_logo.png')}
  />
);
