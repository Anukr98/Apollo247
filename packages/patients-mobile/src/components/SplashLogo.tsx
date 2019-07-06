import React from 'react';
import { Image, ImageProps } from 'react-native';

export const SplashLogo: React.FC<Partial<ImageProps>> = (props) => (
  <Image
    style={{ width: 152, height: 117 }}
    {...props}
    source={require('app/src/images/apollo/splashLogo.png')}
  />
);
