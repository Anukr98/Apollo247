import React from 'react';
import { Image, ImageProps } from 'react-native';

export const SplashLogo: React.FC<Partial<ImageProps>> = (props) => (
  <Image
    style={{ width: 150, height: 116 }}
    {...props}
    source={require('@aph/mobile-patients/src/images/apollo/splashLogo.png')}
  />
);
