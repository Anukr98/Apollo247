import React from 'react';
import { Image, ImageProps } from 'react-native';

export const HomeLogo: React.FC<Partial<ImageProps>> = (props) => (
  <Image
    style={{ width: 32, height: 32 }}
    {...props}
    source={require('@aph/mobile-patients/src/images/apollo/ic_home.png')}
  />
);
