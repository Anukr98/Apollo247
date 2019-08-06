import 'unfetch/polyfill';

declare global {
  interface Window {
    __TEST__: string;
  }
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'local' | 'development' | 'staging' | 'production';
      USE_SSL: 'true' | 'false';
      WEB_PATIENTS_HOST: string;
      WEB_PATIENTS_PORT: string;
      WEB_DOCTORS_HOST: string;
      WEB_DOCTORS_PORT: string;
      API_GATEWAY_HOST: string;
      API_GATEWAY_PORT: string;
      GOOGLE_APPLICATION_CREDENTIALS: string;
      FIREBASE_PROJECT_ID: string;
    }
  }
}

import { AppContainer } from 'components/AppContainer';
import React from 'react';
import ReactDOM from 'react-dom';

ReactDOM.render(<AppContainer />, document.getElementById('root'));
