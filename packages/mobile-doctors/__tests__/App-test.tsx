import 'react-native';
import React from 'react';
import renderer from 'react-test-renderer';
import { AppContainer } from '@aph/mobile-doctors/src/components/AppContainer';

test('AppContainer renders correctly', () => {
  const c = renderer.create(<AppContainer />);
  console.log(c.toJSON());
});
