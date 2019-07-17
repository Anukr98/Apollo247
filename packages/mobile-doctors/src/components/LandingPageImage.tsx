import * as React from 'react';
import { Image, ImageProps } from 'react-native';

export const LandingPageImage: React.FC<Partial<ImageProps>> = (props) => (
  <Image
    style={{ width: '100%', height: 'auto' }}
    {...props}
    source={require('@aph/mobile-doctors/src/images/apollo/illustration_mobile_consult_a_doctor.png')}
  />
);
