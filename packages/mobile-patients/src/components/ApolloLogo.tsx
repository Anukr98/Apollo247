import React from 'react';
import { Image, ImageProps } from 'react-native';

export const ApolloLogo: React.FC<Partial<ImageProps>> = (props) => (
  <Image
    style={{ width: 77, height: 57 }}
    {...props}
    source={require('@aph/mobile-patients/src/images/apollo/apollo_logo.webp')}
  />
);
