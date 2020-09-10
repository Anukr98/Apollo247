import '@aph/universal/dist/global';
import 'unfetch/polyfill';

import { AppContainer } from 'components/AppContainer';
import React from 'react';
import ReactDOM from 'react-dom';
// import TagManager from 'react-gtm-module';

// const tagManagerArgs = {
//   gtmId: 'GTM-PNGHP4L',
//   auth: process.env.NODE_ENV === 'production' ? 'ZYg6LjWjUuzof34ZcHS7HA' : 'W92SKp1i2YZ7knnE2uBPtw',
//   preview: process.env.NODE_ENV === 'production' ? 'env-1' : 'env-76',
// };

// TagManager.initialize(tagManagerArgs);

declare global {
  interface Window {
    // add you custom properties and methods
    gep(a: any, b: any, c?: any, d?: any, e?: any): void;

    _ur(a: any, b?: any, c?: any): void;

    _cb(a: any, b: any, c: any, d: any, e: any, f: any, h: any): void;

    _ob(a: any, b: any, c: any, d: any, e: any, f: any, h: any): void;
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
