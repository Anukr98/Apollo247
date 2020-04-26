import '@aph/universal/dist/global';
import 'unfetch/polyfill';

import { AppContainer } from 'components/AppContainer';
import React from 'react';
import ReactDOM from 'react-dom';

declare global {
  interface Window {
    // add you custom properties and methods
    gep(a: any, b: any, c?: any, d?: any): void;
    _ur(a: any, b?: any, c?: any): void;
    _cb(a: any, b: any, c: any, d: any, e: any, f: any, g: any, h: any, i: any): void;
  }
}

ReactDOM.render(<AppContainer />, document.getElementById('root'));
