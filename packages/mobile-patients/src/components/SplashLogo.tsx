import React from 'react';
import { Image, ImageProps, Platform } from 'react-native';

export const SplashLogo: React.FC<Partial<ImageProps>> = (props) => (
  <Image
    style={{
      width: 152,
      height: 117,
      ...Platform.select({
        android: {
          top: 12,
        },
      }),
    }}
    {...props}
    source={require('@aph/mobile-patients/src/images/apollo/splashLogo.png')}
  />
);
