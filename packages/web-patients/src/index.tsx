import 'unfetch/polyfill';

declare global {
  interface Window {
    __TEST__: string;
  }
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'local' | 'dev';
      WEB_PATIENTS_PORT: string;
      API_GATEWAY_PORT: string;
      GOOGLE_APPLICATION_CREDENTIALS: string;
      FIREBASE_PROJECT_ID: string;
      TEST: string;
    }
  }
}

import { AppContainer } from 'components/AppContainer';
import React from 'react';
import ReactDOM from 'react-dom';

ReactDOM.render(<AppContainer />, document.getElementById('root'));
