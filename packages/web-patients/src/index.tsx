import '@aph/universal/dist/global';
import 'unfetch/polyfill';

import { AppContainer } from 'components/AppContainer';
import React from 'react';
import ReactDOM from 'react-dom';
import TagManager from 'react-gtm-module';

const tagManagerArgs = {
  gtmId: process.env.NODE_ENV === 'production' ? 'GTM-PNGHP4L' : 'GTM-MTDCHDP',
};

TagManager.initialize(tagManagerArgs);

declare global {
  interface Window {
    // add you custom properties and methods
    gep(a: any, b: any, c?: any, d?: any, e?: any): void;

    _ur(a: any, b?: any, c?: any): void;

    _cb(a: any, b: any, c: any, d: any, e: any, f: any, h: any): void;

    _ob(a: any, b: any, c: any, d: any, e: any, f: any, h: any): void;

    dataLayer: any;
  }
}

ReactDOM.render(<AppContainer />, document.getElementById('root'));

// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker
//       .register('/service-worker.js')
//       .then((registration) => {
//         console.log('SW registered: ', registration);
//       })
//       .catch((registrationError) => {
//         console.log('SW registration failed: ', registrationError);
//       });
//   });
// }
