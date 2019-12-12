/**
 * @format
 */

import 'react-native';
import React from 'react';
import { AppContainer } from '@aph/mobile-patients/src/components/AppContainer';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

it('renders correctly', () => {
  renderer.create(<AppContainer />);
});
