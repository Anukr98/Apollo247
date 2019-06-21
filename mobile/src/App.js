
import React from 'react';
import { Provider } from 'react-redux';

import AppNavigation from './Navigation/AppNavigation';
import configureStore from './Redux';

const store = configureStore()

const RNRedux = () => (
  <Provider store = { store }>
    <AppNavigation />
  </Provider>
)

export default RNRedux
