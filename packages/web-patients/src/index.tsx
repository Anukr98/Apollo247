import '@aph/universal/dist/global';
import 'unfetch/polyfill';

import { AppContainer } from 'components/AppContainer';
import React from 'react';
import ReactDOM from 'react-dom';

import TagManager from 'react-gtm-module';

const tagManagerArgs = {
  gtmId: 'GTM-PNGHP4L',
};

TagManager.initialize(tagManagerArgs);

ReactDOM.render(<AppContainer />, document.getElementById('root'));
