/**
 * @format
 */

import { AppContainer } from '@aph/mobile-patients/src/components/AppContainer';
import React from 'react';
import 'react-native';
import renderer from 'react-test-renderer';

it('renders correctly', () => {
  const tree = renderer.create(<AppContainer />).toJSON();
  expect(tree).toMatchSnapshot();
});
