import React from 'react';
import { Image, ImageProps, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const ApolloLogo: React.FC<ImageProps> = (props) => (
  <Image
    style={{ width: 77, height: 57, left: width - 97, top: 20 }}
    {...props}
    source={require('app/src/__new__/images/apollo/apollo_logo.png')}
  />
);
